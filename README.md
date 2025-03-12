# Readefine Extension
The Readefine Chrome Extension is built using this repo + build tool alongside the Readefine web app (parallel directory named `readefinewebapp`). As you can see in the package.json, the build script first copies the web app into the extension's /source/popup, then merges in popup dependencies, which override the popup behavior in an extension context, then builds the extension popup, background/service worker, and content scripts. After completing the build process, the build script deletes the dist and popup directories.

To build the extension, first ensure that all packages are installed. To do so, execute this command from root of this folder (`/`):

`npm i && cd source && npm i && cd select-to-readefine && npm i && cd ../../readefinewebapp && npm i`

(or substitute npm with bun if you prefer). After executing this, navigate back to the extension directory.

Now that packages are installed, we should be able to build the extension:
`npm run build` (or `bun run build`)

This builds the chrome ready version of the extension. To build for Edge, Firefox, add ` -- all` to the command. NB: Safari requires extra files that are not available publicly, so the build script does not build for Safari.