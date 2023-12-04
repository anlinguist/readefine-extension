import { copyFileSync, readdirSync, statSync, existsSync, mkdirSync, promises as fsPromises } from 'fs';
import path from 'path';

class FirefoxBuildManager {
    constructor() {
        this.frames = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"];
        this.loadingInterval = null;
        this.lastMessageLength = 0;
    }

    async build() {
        console.log("Preparing Firefox extension.")
        await this.copySourceToDestination('./firefox');
        await this.modifyFirefoxFiles();
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

    async modifyFirefoxFiles() {
        console.log("Modifying Firefox extension files.");

        const firefoxResourcesDir = './firefox';
        const firefoxManifestPath = path.join(firefoxResourcesDir, 'manifest.json');

        await this.modifyFilesInDirectory(firefoxResourcesDir, '.js', 'chrome.', 'browser.');
        await this.modifyFilesInDirectory(firefoxResourcesDir, '.css', '#root,.App,body,html{font-family:Roboto-Light;height:100%}', '#root,.App,body,html{font-family:Roboto-Light;min-width:380px;min-height:600px;}html.contextContentScript #root,html.contextContentScript .App,html.contextContentScript body,html.contextContentScript{min-width:350px;min-height:515px;}');
        await this.modifyFirefoxManifest(firefoxManifestPath);
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
}

export default FirefoxBuildManager;

if (process.argv[1] === import.meta.url.substring(7)) {
    // The script is being run directly
    const ffBuildManager = new FirefoxBuildManager();
    ffBuildManager.build();
}