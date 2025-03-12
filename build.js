import { copyFileSync, readdirSync, statSync, existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync, promises as fsPromises } from 'fs';
import path from 'path';
import FirefoxBuildManager from './firefoxBuild.js';
import { exec } from 'child_process';
import { rm } from 'fs/promises';
import { rollup } from 'rollup';

import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'postcss';
import cssnano from 'cssnano';

class BuildManager {
    constructor() {
        this.frames = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"];
        this.loadingInterval = null;
        this.lastMessageLength = 0;
        this.alreadyBuilt = false;
        this.buildAll = false;
        this.justSafari = false;
        this.verbose = false;
    }

    async build() {
        this.processArgs();

        if (this.justSafari) {
            await this.prepareSafari();
            return;
        }

        if (!existsSync('chrome')) {
            mkdirSync('chrome');
        }
        if (!existsSync('chrome/popup')) {
            mkdirSync('chrome/popup');
        }
        await this.prepareChrome();

        if (this.buildAll) {
            await this.prepareEdge();
            await this.prepareFirefox();
            await this.prepareSafari();
        }
        await this.removeExtraFiles();
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

    async copyChromeToDestination(destinationDir) {
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
        this.copyFilesToDestination('./chrome', destinationDir, ignoreList);
        this.stopLoading(copiedMessage);
    }

    async copySourceToDestination(browser = 'chrome') {
        this.startLoading(`Deleting existing /${browser} folder.`);

        let deleted = false;
        try {
            await rm(`./${browser}`, { recursive: true, force: true });
            deleted = true
        } catch (error) {
            console.error(`Failed to remove directory: ${error}`);
        }

        if (!deleted) {
            this.stopLoading(`No existing /${browser} folder found.`);
        } else {
            this.stopLoading(`Deleted existing /${browser} folder.`);
        }

        this.startLoading(`Copying source folder to /${browser}.`);
        const ignoreList = [
            "MailFramesBaseCS.ts",
            "node_modules",
            "public",
            "src",
            ".gitignore",
            "package-lock.json",
            "package.json",
            "README.md",
            "background",
            "auth.ts",
            "popupdeps",
            "content",
            "tsconfig.json",
            "popup",
            "dist",
            "global.d.ts",
            "popupbu",
            "index.html",
            ".eslintrc.cjs",
            "bun.lockb",
            "vite.config.js",
            "vite.config.ts",
            "tsconfig.node.json",
            "tsconfig.app.json",
            "tsconfig.app.tsbuildinfo",
            "tsconfig.node.tsbuildinfo",
            "eslint.config.js",
        ];
        this.copyFilesToDestination('./source', `./${browser}`, ignoreList);
        this.stopLoading(`Source folder copied to /${browser}.`);

        this.startLoading(`Copying compiled popup ts files to /${browser}/popup.`);
        this.copyFilesToDestination('./source/popup/dist', `./${browser}/popup`);
        this.stopLoading(`Popup copied to /${browser}/popup.`);

        this.startLoading(`Copying compiled select to readefine files to /${browser}/select-to-readefine.`);
        this.copyFilesToDestination(`./source/select-to-readefine/dist`, `./${browser}/select-to-readefine/build`);
        this.stopLoading(`Select to Readefine copied to /${browser}/select-to-readefine.`);

        this.startLoading(`Copying compiled background ts files to /${browser}/background.`);
        this.copyFilesToDestination(`./source/dist`, `./${browser}`);
        this.stopLoading(`Background and Content Scripts copied to /${browser}/background and /${browser}/content.`);
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
                process.exit(1);
            });
        });
    }

    async prepareChrome() {
        await this.checkAndUpdateDependencies();
        await this.copyPopupFromWebApp();
        await this.prepareSelectToReadefine();
        await this.buildTypeScript();
        await this.copySourceToDestination('chrome');
    }

    async removeExtraFiles() {
        try {
            if (existsSync('./source/dist')) {
                this.startLoading("Removing the source/dist directory.");
                await rm('./source/dist', { recursive: true });
                this.stopLoading("Removed the source/dist directory.");
            }
            if (existsSync('./source/popup')) {
                this.startLoading("Removing the source/popup directory.");
                await rm('./source/popup', { recursive: true });
                this.stopLoading("Removed the source/popup directory.");
            }
        } catch (err) {
            console.error(`An error occurred while removing the source/dist directory: ${err}`);
        }
    }

    async checkAndUpdateDependencies() {
        await this.execAsync('bun i', { cwd: './source' });
    }

    async copyPopupFromWebApp() {
        this.startLoading("Copying the popup from the web app.");
        await this.execAsync('bun run prepare-popup', { cwd: './' });
        this.stopLoading("Popup copied from the web app.");
    }

    async prepareSelectToReadefine() {
        this.startLoading("Preparing Select to Readefine.");
        await this.execAsync('bun run prepare-select-to-readefine', { cwd: './' });
        this.stopLoading("Select to Readefine prepared.");
    }

    async buildTypeScript() {
        this.startLoading("Building the TypeScript files.");
        let cs = `./source/content/`
        const allowedCSFiles = ['check_login_status_cs.ts', 'content.ts', 'readefine_version.ts']
        let contentScriptFiles = readdirSync(cs, { withFileTypes: true })
            .filter(dirent => dirent.isFile() && dirent.name.endsWith('.ts') && allowedCSFiles.includes(dirent.name))
            .map(dirent => `${cs}${dirent.name}`);
        let configurations = [
            {
                input: ['./source/background/serviceWorker.ts'],
                preserveSymlinks: true,
                plugins: [
                    nodeResolve({
                        browser: true,
                    }),
                    commonjs(),
                    typescript({
                        tsconfig: './source/tsconfig.json'
                    }),
                    terser()
                ],
                output: {
                    dir: './source/dist/background',
                    format: 'es',
                    entryFileNames: '[name].js'
                }
            },
            {
                input: ['./source/pages/auth.ts'],
                preserveSymlinks: true,
                plugins: [
                    nodeResolve({
                        browser: true,
                    }),
                    commonjs(),
                    typescript({
                        tsconfig: './source/tsconfig.json'
                    }),
                    terser()
                ],
                output: {
                    dir: './source/dist/pages',
                    format: 'es',
                    entryFileNames: '[name].js'
                }
            }
        ];

        contentScriptFiles.map((file) => {
            const fileName = file.split('/').pop();
            const name = fileName.split('.')[0];

            configurations.push({
                input: file,
                plugins: [
                    typescript({
                        tsconfig: './source/tsconfig.json',
                    }),
                    terser({
                        keep_classnames: true,
                        keep_fnames: true,
                        mangle: {
                            keep_classnames: true,
                            keep_fnames: true,
                        },
                    }),
                ],
                output: {
                    dir: './source/dist/content',
                    format: 'iife',
                    entryFileNames: `${name}.js`,
                    name: `${name}ReadefineImplementation`,
                },
            });
        });


        try {
            for (const config of configurations) {
                const bundle = await rollup(config);
                await bundle.write(config.output);
            }

            const cssInputPath = './source/content/content.css';
            const cssOutputPath = './source/dist/content/content.css';

            const css = readFileSync(cssInputPath, 'utf8');

            const result = await postcss([
                cssnano({
                    preset: 'default',
                }),
            ]).process(css, {
                from: cssInputPath,
                to: cssOutputPath,
            });

            writeFileSync(cssOutputPath, result.css);
            this.stopLoading("TypeScript build complete.");
        } catch (error) {
            this.terminateLoading("TypeScript build errors occurred");
            console.error(error);
            process.exit(1);
        }
    }

    async prepareEdge() {
        await this.copySourceToDestination('edge');

        // on dev: need to add key: MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAphGOYZRZFAoYIAPGJ0dlHmig1uPh3Fp/111n5PPd9px4ObBCEApN1VHq9TfFC3Aquavit7FIrz0v1Cx2t3nXGih/Uf7KJ0ZMRnpjrCsY20kJ4p4InLiWf/51lRbjT3JuI4cWz5SW7Mj8rZC4SHBwXuf+GyWNLuL+2Zi4Xvz7LUiX8MG3HXGnkBWy4pxkXQhRFZpzZRqBfYUzFC49EeGVwckEMLeQGKkp6tTXjL5MLOxudzdVOSZ0T3sjrjCExh3RSGBh9jmQxw13R8N3WbTPFYKmcLzwHom8V6OihOV6CLrr4s2DVOZFyZE64EjusV1JGLE1BxWbMNxqoQjLsnF4DwIDAQAB
    }

    async prepareFirefox() {
        const firefoxBuilder = new FirefoxBuildManager();
        await firefoxBuilder.build();
    }

    async prepareSafari() {
        await this.copyChromeToDestination('safari/Readefine/Shared (Extension)/Resources');
        await this.modifySafariFiles();
    }

    async modifySafariFiles() {
        const safariResourcesDir = './safari/Readefine/Shared (Extension)/Resources';
        const safariManifestPath = path.join(safariResourcesDir, 'manifest.json');

        await this.modifyFilesInDirectory(safariResourcesDir, '.js', 'chrome\\.', 'browser.');
        await this.modifyFilesInDirectory(safariResourcesDir, '.css', '#root,.App,body,html{font-family:Roboto-Light;height:100%}', '#root,.App,body{font-family:Roboto-Light;height:100%}');
        await this.modifyFilesInDirectory(
            safariResourcesDir,
            '.css',
            'html,body,#root,\\.App{height:100%}',
            'html{height:600px;width:400px;}@supports(-webkit-touch-callout:none){html{height:100%; width:100%}} body,#root,.App{height:100%;}'
          );
          
        await this.modifyFilesInDirectory(safariResourcesDir, '.css', 'html,body,#root{height:100%}', 'body,#root{height:100%}');
        await this.modifySafariManifest(safariManifestPath);
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

    async modifySafariManifest(manifestPath) {
        const manifestData = JSON.parse(await fsPromises.readFile(manifestPath, 'utf8'));
        manifestData['background'] = {
            'persistent': false,
            'scripts': ["background/serviceWorker.js"],
            'type': "module"
        };
        manifestData['manifest_version'] = 3;
        manifestData['permissions'] = ["storage", "tabs", "notifications", "nativeMessaging"];
        manifestData['externally_connectable']['matches'].push("http://127.0.0.1/*")

        await fsPromises.writeFile(manifestPath, JSON.stringify(manifestData, null, 4));
    }

    processArgs() {
        for (let i = 2; i < process.argv.length; i++) {
            const arg = process.argv[i];
            if (arg === 'all') {
                this.buildAll = true;
            } else if (arg === 'verbose') {
                this.verbose = true;
            } else if (arg == 'justsafari') {
                this.justSafari = true;
            }
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