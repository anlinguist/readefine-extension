import shutil
import os
from distutils.dir_util import copy_tree
import json
import glob
import re

def prepareChrome():
    shutil.rmtree('chrome_prod', ignore_errors=True)
    os.chdir('chrome/popup')
    os.system('npm run build')
    os.chdir('../../')
    fromDirectory = "chrome"
    toDirectory = "chrome_prod"
    shutil.copytree(fromDirectory , toDirectory ,ignore=shutil.ignore_patterns("node_modules", "public", "src", ".gitignore", "package-lock.json", "package.json", "README.md"))

def buildff():
    shutil.rmtree('firefox', ignore_errors=True)
    # copy subdirectory example
    fromDirectory = "chrome_prod"
    toDirectory = "firefox"
    shutil.copytree(fromDirectory, toDirectory, False, None)

    with open('firefox/manifest.json', 'r') as json_file:
        data = json.load(json_file)

    gecko = {}
    applications = {}
    data['browser_specific_settings'] = applications
    applications['gecko'] = gecko
    gecko['id'] = "readefine@app"
    gecko['strict_min_version'] = "53.0"

    bg = {}
    data['background'] = bg
    bg['scripts'] = ["js/background.js"]
    del data['externally_connectable']
    del data['key']

    with open('firefox/manifest.json', 'w') as json_file:
        json.dump(data, json_file, indent=4)
    

    ffdirjs = r'firefox/js/'
    ffpopupdir = r'firefox/popup/build/static/js/'
    ffpopupcss = r'firefox/popup/build/static/css/'
    
    for filename in os.listdir(ffdirjs):
        if filename == '.DS_Store':
            continue
        thefile = ffdirjs + filename
        with open(thefile, 'r') as file:
            filedata = file.read()
        # need to replace chrome. with browser.
        filedata = filedata.replace('chrome.', 'browser.')
        # need to replace sendResponse with resolve
        # filedata = filedata.replace('sendResponse(', 'resolve(')
        with open(thefile, 'w') as file:
            file.write(filedata)
    
    for filename in os.listdir(ffpopupdir):
        if filename == '.DS_Store':
            continue
        if not filename.endswith('js'):
            continue
        thefile = ffpopupdir + filename
        with open(thefile, 'r') as file:
            filedata = file.read()
        # need to replace chrome. with browser.
        filedata = filedata.replace('chrome.', 'browser.')
        with open(thefile, 'w') as file:
            file.write(filedata)

    for filename in os.listdir(ffpopupcss):
        if filename == '.DS_Store':
            continue
        if not filename.endswith('css'):
            continue
        thefile = ffpopupcss + filename
        with open(thefile, 'r') as file:
            filedata = file.read()
        filedata = filedata.replace('#root,.App,body,html{font-family:Roboto-Light;height:100%}', '#root,.App,body,html{font-family:Roboto-Light;min-width:380px;min-height:600px;}html.contextContentScript #root,html.contextContentScript .App,html.contextContentScript body,html.contextContentScript{min-width:350px;min-height:515px;}')
        with open(thefile, 'w') as file:
            file.write(filedata)

def buildedge():
    shutil.rmtree('edge', ignore_errors=True)

    # copy subdirectory example
    fromDirectory = "chrome_prod"
    toDirectory = "edge"
    shutil.copytree(fromDirectory, toDirectory, False, None)

    with open('edge/manifest.json', 'r') as json_file:
        data = json.load(json_file)

    data['key'] = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAphGOYZRZFAoYIAPGJ0dlHmig1uPh3Fp/111n5PPd9px4ObBCEApN1VHq9TfFC3Aquavit7FIrz0v1Cx2t3nXGih/Uf7KJ0ZMRnpjrCsY20kJ4p4InLiWf/51lRbjT3JuI4cWz5SW7Mj8rZC4SHBwXuf+GyWNLuL+2Zi4Xvz7LUiX8MG3HXGnkBWy4pxkXQhRFZpzZRqBfYUzFC49EeGVwckEMLeQGKkp6tTXjL5MLOxudzdVOSZ0T3sjrjCExh3RSGBh9jmQxw13R8N3WbTPFYKmcLzwHom8V6OihOV6CLrr4s2DVOZFyZE64EjusV1JGLE1BxWbMNxqoQjLsnF4DwIDAQAB"
    
    with open('edge/manifest.json', 'w') as json_file:
        json.dump(data, json_file, indent=4)

def createstaging():
    shutil.rmtree('safari-staging', ignore_errors=True)
    fromDirectory = "chrome_prod"
    toDirectory = "safari-staging"
    shutil.copytree(fromDirectory, toDirectory, False, None)

def buildsafari():
    createstaging()
    shutil.rmtree('safari-macos', ignore_errors=True)
    shutil.rmtree('safari-ios', ignore_errors=True)

    ffpopupdir = r'safari-staging/popup/build/static/js/'
    ffpopupcss = r'safari-staging/popup/build/static/css/'
    for filename in os.listdir(ffpopupdir):
        if filename == '.DS_Store':
            continue
        if not filename.endswith('js'):
            continue
        thefile = ffpopupdir + filename
        with open(thefile, 'r') as file:
            filedata = file.read()
        # need to replace chrome. with browser.
        filedata = filedata.replace('chrome.', 'browser.')
        with open(thefile, 'w') as file:
            file.write(filedata)

    for filename in os.listdir(ffpopupcss):
        if filename == '.DS_Store':
            continue
        if not filename.endswith('css'):
            continue
        thefile = ffpopupcss + filename
        with open(thefile, 'r') as file:
            filedata = file.read()
        filedata = filedata.replace('#root,.App,body,html{font-family:Roboto-Light;height:100%}', '#root,.App,body{font-family:Roboto-Light;height:100%}')
        with open(thefile, 'w') as file:
            file.write(filedata)

    with open('safari-staging/manifest.json', 'r') as json_file:
        data = json.load(json_file)

    icons = {}
    data['icons'] = icons
    icons['16'] = "logo/square/square16x16.png"
    icons['48'] = "logo/square/square19x19.png"
    icons['32'] = "logo/square/square32x32.png"
    icons['48'] = "logo/square/square38x38.png"
    icons['48'] = "logo/square/square48x48.png"
    icons['64'] = "logo/square/square64x64.png"
    icons['128'] = "logo/square/square128x128.png"
    icons['256'] = "logo/square/square256x256.png"
    icons['512'] = "logo/square/square512x512.png"
    icons['1024'] = "logo/square/square1024x1024.png"

    bg = {}
    data['background'] = bg
    bg['persistent'] = False
    bg['scripts'] = ["js/background.js"]
    data['manifest_version']= 3
    data['permissions'] = ["storage","tabs","notifications","nativeMessaging"]

    with open('safari-staging/manifest.json', 'w') as json_file:
        json.dump(data, json_file, indent=4)

    # os.chdir('..')
    shutil.rmtree('safari', ignore_errors=True)
    os.mkdir('safari')
    os.system('sudo xcode-select -s /Applications/Xcode.app/Contents/Developer')
    os.system('xcrun safari-web-extension-converter safari-staging --project-location "safari" --app-name "Readefine" --swift --no-open --copy-resources --force')

    print('at root dir again...')
    print(os.getcwd())
    c_icon_files = glob.glob("safari/readefine/Shared (App)/Assets.xcassets/AppIcon.appiconset/*")
    for i_file in c_icon_files:
        os.remove(i_file)
    # copy ./chrome/logo/ios/* to ./safari/readefine/Shared (App)/Assets.xcassets/AppIcon.appiconset
    for file in os.listdir("chrome/logo/ios"):
        shutil.copy("chrome/logo/ios/" + file, "safari/readefine/Shared (App)/Assets.xcassets/AppIcon.appiconset/")
    for file in os.listdir("safari-assets/images"):
        shutil.copy("safari-assets/images/" + file, "safari/readefine/Shared (App)/Resources/")
    shutil.copy("safari-assets/ViewController.swift", "safari/readefine/Shared (App)/")
    shutil.copy("safari-assets/Script.js", "safari/readefine/Shared (App)/Resources/Script.js")
    shutil.copy("safari-assets/Style.css", "safari/readefine/Shared (App)/Resources/Style.css")
    shutil.copy("safari-assets/Roboto-Light.woff2", "safari/readefine/Shared (App)/Resources/Roboto-Light.woff2")
    shutil.copy("safari-assets/Roboto-Regular.woff2", "safari/readefine/Shared (App)/Resources/Roboto-Regular.woff2")
    shutil.copy("safari-assets/Roboto-Thin.woff2", "safari/readefine/Shared (App)/Resources/Roboto-Thin.woff2")
    shutil.copy("safari-assets/Main.html", "safari/readefine/Shared (App)/Base.lproj/Main.html")
    shutil.copy("safari-assets/AppDelegate.swift", "safari/readefine/iOS (App)/AppDelegate.swift")
    shutil.copy("safari-assets/MacAppDelegate.swift", "safari/readefine/macOS (App)/AppDelegate.swift")
    shutil.copy("safari-assets/Main.storyboard", "safari/readefine/macOS (App)/Base.lproj/Main.storyboard")
    shutil.copy("safari-assets/SafariWebExtensionHandler.swift", "safari/readefine/Shared (Extension)/SafariWebExtensionHandler.swift")
    # Read in the file
    # os.chdir('readefine')
    # os.system('xcodebuild -scheme "readefine" build')

prepareChrome()
buildff()
buildedge()
buildsafari()