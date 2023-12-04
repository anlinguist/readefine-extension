import { copyFileSync, readdirSync, statSync, existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync, promises as fsPromises } from 'fs';
import path from 'path';
import FirefoxBuildManager from './firefoxBuild.js';
import { exec } from 'child_process';

class BuildManager {
    constructor() {
        this.originalPreviousPopupSnapshot = null;
        this.originalPreviousSelectToReadefineSnapshot = null;
        this.originalPopupPackageJson = null;
        this.originalSelectToReadefinePackageJson = null;

        this.frames = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"];
        this.loadingInterval = null;
        this.lastMessageLength = 0;
        this.alreadyBuilt = false;
        this.buildAll = false;
        this.verbose = false;
    }

    async build() {
        this.processArgs();

        await this.prepareChrome();
        console.log("finished preparing chrome, moving on to other browsers")
        const arg = process.argv[2]

        if (this.buildAll) {
            await this.prepareFirefox();
            await this.prepareEdge();
        }

    }

    async checkAndBuildSource() {
        await this.checkAndBuildAppSource('./source/popup', 'previous_popup_snapshot.json');
        await this.checkAndBuildAppSource('./source/select-to-readefine', 'previous_select_to_readefine_snapshot.json');
    }

    async checkAndBuildAppSource(appPath, snapshotFileName) {
        const sourceDir = `${appPath}/src`;

        if (this.hasDirectoryChanged(sourceDir, snapshotFileName) && !this.alreadyBuilt) {
            this.startLoading(`Rebuilding the Readefine app at ${appPath} to use the latest source code.`);
            await this.execAsync('npm run build', { cwd: appPath });
            this.stopLoading("Build complete.");
            this.alreadyBuilt = true;
        } else if (!this.alreadyBuilt) {
            console.log(`No changes detected in Readefine app source code at ${appPath}.`);
        }
    }

    async checkAndUpdateAppDependencies(appPath, previousPackageJsonFileName) {
        const packageJsonPath = `${appPath}/package.json`;
        let packageJsonPreviousContent = '';

        if (existsSync(previousPackageJsonFileName)) {
            packageJsonPreviousContent = readFileSync(previousPackageJsonFileName, 'utf8');
        }

        const packageJsonCurrentContent = readFileSync(packageJsonPath, 'utf8');

        if (packageJsonCurrentContent !== packageJsonPreviousContent) {
            copyFileSync(packageJsonPath, previousPackageJsonFileName);
            this.startLoading(`Installing package dependencies for ${appPath}${packageJsonPreviousContent ? ' (package.json changed).' : '.'}`);
            await this.execAsync('npm i', { cwd: appPath });
            this.stopLoading("Dependencies installed.");

            this.startLoading(`Building the Readefine app at ${appPath} to use the latest dependencies.`);
            await this.execAsync('npm run build', { cwd: appPath });
            this.stopLoading("Build complete.");
            this.alreadyBuilt = true;
        }
    }

    async checkAndUpdateDependencies() {
        await this.checkAndUpdateAppDependencies('./source/popup', 'previous_popup_package.json');
        await this.checkAndUpdateAppDependencies('./source/select-to-readefine', 'previous_select_to_readefine_package.json');
    }

    copyFilesToDestination(src, dest, ignore = []) {
        try {
            if (!existsSync(dest)) {
                mkdirSync(dest, { recursive: true });
            }

            const files = readdirSync(src);
            files.forEach(file => {
                const fullPathSrc = path.join(src, file);
                const fullPathDest = path.join(dest, file);
                const stat = statSync(fullPathSrc);

                if (ignore.includes(file)) {
                    return;
                }

                if (stat.isDirectory()) {
                    mkdirSync(fullPathDest, { recursive: true });
                    this.copyFilesToDestination(fullPathSrc, fullPathDest, ignore);
                } else if (stat.isFile()) {
                    copyFileSync(fullPathSrc, fullPathDest);
                }
            });
        } catch (err) {
            console.error(`An error occurred: ${err}`);
        }
    }

    async copySourceToDestination(destinationDir) {
        const startMessage = `Deleting existing ${destinationDir} folder.`;
        const deleteErrorMessage = `Failed to remove directory in ${destinationDir}: `;
        const noFolderMessage = `No existing ${destinationDir} folder found.`;
        const deletedMessage = `Deleted existing ${destinationDir} folder.`;
        const copyingMessage = `Copying source folder to ${destinationDir}.`;
        const copiedMessage = `Source folder copied to ${destinationDir}.`;

        this.startLoading(startMessage);

        let deleted = false;
        try {
            await fsPromises.rm(destinationDir, { recursive: true, force: true });
            deleted = true;
        } catch (error) {
            console.error(deleteErrorMessage + error);
        }

        if (!deleted) {
            this.stopLoading(noFolderMessage);
        } else {
            this.stopLoading(deletedMessage);
        }

        this.startLoading(copyingMessage);
        const ignoreList = ["node_modules", "public", "src", ".gitignore", "package-lock.json", "package.json", "README.md"];
        this.copyFilesToDestination('./source', destinationDir, ignoreList);
        this.stopLoading(copiedMessage);
    }

    execAsync(command, options = {}) {
        return new Promise((resolve, reject) => {
            const child = exec(command, options);

            if (this.verbose) {
                child.stdout.pipe(process.stdout);
                child.stderr.pipe(process.stderr);
            }

            child.on('exit', (code, signal) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Exited with code ${code} and signal ${signal}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });

            process.on('SIGINT', () => {
                child.kill();
                this.terminateLoading();
                this.restoreOriginalJSONs();
                process.exit(1);
            });
        });
    }

    generateSnapshot(dir) {
        let list = [];
        const files = readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = statSync(fullPath);
            if (stat.isDirectory()) {
                list = list.concat(this.generateSnapshot(fullPath));
            } else if (stat.isFile()) {
                list.push({ path: fullPath, mtime: stat.mtimeMs });
            }
        });
        return list;
    }

    hasDirectoryChanged(directory, snapshotFile) {
        const currentSnapshot = this.generateSnapshot(directory).sort((a, b) => a.path.localeCompare(b.path));
        const currentSnapshotString = JSON.stringify(currentSnapshot);
        let previousSnapshotString = '';

        if (existsSync(snapshotFile)) {
            previousSnapshotString = readFileSync(snapshotFile, 'utf8');
        }

        if (currentSnapshotString !== previousSnapshotString) {
            writeFileSync(snapshotFile, currentSnapshotString);
            return true;
        }

        return false;
    }

    async prepareChrome() {
        try {
            this.readOriginalJSONs();
            await this.checkAndUpdateDependencies();
            await this.checkAndBuildSource();
            await this.copySourceToDestination('./chrome');
        } catch (err) {
            console.log("An error occurred during the build process:", err);
        }
    }

    async prepareEdge() {
        console.log("Preparing Edge extension.")
        await this.copySourceToDestination('./edge');
    }

    async prepareFirefox() {
        const firefoxBuilder = new FirefoxBuildManager();
        await firefoxBuilder.build();
    }

    async modifyFirefoxFiles() {
        console.log("Modifying Firefox extension files.");

        const firefoxResourcesDir = './firefox';
        const firefoxManifestPath = path.join(firefoxResourcesDir, 'manifest.json');

        await this.modifyFilesInDirectory(firefoxResourcesDir, '.js', 'chrome.', 'browser.');
        await this.modifyFilesInDirectory(firefoxResourcesDir, '.css', '#root,.App,body,html{font-family:Roboto-Light;height:100%}', '#root,.App,body,html{font-family:Roboto-Light;min-width:380px;min-height:600px;}html.contextContentScript #root,html.contextContentScript .App,html.contextContentScript body,html.contextContentScript{min-width:350px;min-height:515px;}');
        await this.modifyFirefoxManifest(firefoxManifestPath);
    }

    async modifyFirefoxManifest(manifestPath) {
        const manifestData = JSON.parse(await fsPromises.readFile(manifestPath, 'utf8'));
        manifestData['background'] = {
            'scripts': ["js/background.js"]
        };

        manifestData['browser_specific_settings'] = {
            'gecko': {
                'id': 'readefine@app',
                'strict_min_version': '53.0'
            }
        }

        delete manifestData['externally_connectable'];
        delete manifestData['key'];

        await fsPromises.writeFile(manifestPath, JSON.stringify(manifestData, null, 4));
    }

    async modifyFilesInDirectory(directory, extension, searchValue, replaceValue) {
        const entries = await fsPromises.readdir(directory, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                await this.modifyFilesInDirectory(fullPath, extension, searchValue, replaceValue);
            } else if (entry.isFile() && entry.name.endsWith(extension) && entry.name !== '.DS_Store') {
                const fileData = await fsPromises.readFile(fullPath, 'utf8');
                const modifiedData = fileData.replace(new RegExp(searchValue, 'g'), replaceValue);
                await fsPromises.writeFile(fullPath, modifiedData);
            }
        }
    }

    processArgs() {
        for (let i = 2; i < process.argv.length; i++) {
            const arg = process.argv[i];
            if (arg === 'all') {
                this.buildAll = true;
            } else if (arg === 'verbose') {
                this.verbose = true;
            }
        }
    }

    readOriginalJSONs() {
        this.originalPreviousPopupSnapshot = existsSync('previous_popup_snapshot.json')
            ? readFileSync('previous_popup_snapshot.json', 'utf8')
            : null;
        this.originalPreviousSelectToReadefineSnapshot = existsSync('previous_select_to_readefine_snapshot.json')
            ? readFileSync('previous_select_to_readefine_snapshot.json', 'utf8')
            : null;

        this.originalPopupPackageJson = existsSync('previous_popup_package.json')
            ? readFileSync('previous_popup_package.json', 'utf8')
            : null;
        this.originalSelectToReadefinePackageJson = existsSync('previous_select_to_readefine_package.json')
            ? readFileSync('previous_select_to_readefine_package.json', 'utf8')
            : null;
    }

    restoreOriginalJSONs() {
        if (this.originalPreviousPopupSnapshot !== null) {
            writeFileSync('previous_popup_snapshot.json', this.originalPreviousPopupSnapshot);
        }

        if (this.originalPreviousSelectToReadefineSnapshot !== null) {
            writeFileSync('previous_select_to_readefine_snapshot.json', this.originalPreviousSelectToReadefineSnapshot);
        }

        if (this.originalPopupPackageJson !== null) {
            writeFileSync('previous_popup_package.json', this.originalPopupPackageJson);
        }

        if (this.originalSelectToReadefinePackageJson !== null) {
            writeFileSync('previous_select_to_readefine_package.json', this.originalSelectToReadefinePackageJson);
        }
    }

    startLoading(message) {
        let i = 0;
        this.loadingInterval = setInterval(() => {
            let str = `${message} ${this.frames[i]}`;
            this.lastMessageLength = str.length;
            process.stdout.write('\x1b[90m');
            process.stdout.write(`\r${str}`);
            process.stdout.write('\x1b[0m');
            i = (i + 1) % this.frames.length;
        }, 200);
    }

    stopLoading(doneMessage) {
        clearInterval(this.loadingInterval);
        process.stdout.write('\r');
        process.stdout.write(' '.repeat(this.lastMessageLength) + '\r');
        if (doneMessage) {
            console.log('\x1b[32m', `✅ ${doneMessage}`);
        }
    }

    terminateLoading() {
        clearInterval(this.loadingInterval);
        process.stdout.write('\x1b[0m');
        process.stdout.write('\r');
        process.stdout.write(' '.repeat(this.lastMessageLength) + '\r');
        console.log('\x1b[31m', `❌ Build terminated by user.`);
    }
}

const buildManager = new BuildManager();
buildManager.build();