# Quick Start Guide: Nexus19 + React example

This guide will help to setup Nexus19 with the demo of a Form Applet that is built using Nexus19 and React framework.
<br>The applet supports:

- navigation through records
- displaying, editing or deleting records (supporting keyboard shortcuts)
- query and refine query (supporting keyboard shortcuts)
- picklists that are read from Siebel configuration
- field properties that are read from Siebel configuration (required, field length)

This is not an example of implementation that can be used on production. It is intentionally kept straightforward.
The demo example was tested on Seibel 16.19.

![result](demo_react.gif)

1.  Make a clean [Nexus19 Setup](/../wikis/Setup Nexus19) if you haven't done it before.
2.  Import the `n19helper-master/examples/REACT Examples/Form Applet Example/SIF/*` into the Siebel Tools.
3.  Add the `N19 React Account Screen` to your application:
    - Findout your Siebel Application Name in application `.cfg` file or by logging in and typing `SiebelApp.S_App.GetAppName()` into Chrome Developer Tools console.
    - Use Siebel Tools and add `N19 React Account Screen` under `Application > Screen Menu Item` for your Siebel Application Name
    - Also add `N19 React Account Screen`(with `N19 React` value for `Text - String Override` property) under `Application > Page Tab` for your Siebel Application Name
4.  Compile(Siebel IP16 and earlier) or Deliver(Siebel IP17+) following objects:
    - `Nexus 19 React Demo Examples` project
    - Application object, that you've updated above.
5.  Add the `N19 React Account View` to your application:
    - Use Siebel Client to add a new record with Name `N19 React Account View` under `Administration - Application > Views`
    - Under `Administration - Application > Views` add any Responsibility to this View
    - Under `Administration - User > Users` – add same Responsibility to your User
    - Click `Clear cache` button under `Administration – Application > Responsibilities` view
6.  Re-login to your Siebel Application and check that the `N19 React Account Screen` Screen is available.
7.  Copy below files and folders to the `[Siebel Client or Server Home]\public\SCRIPTS\siebel\custom\` folder:
    - `n19helper-master/examples/REACT Examples/Form Applet Example/JS_DIST/*` including `react_dist` folder.
8.  Use Siebel Client to reference js files in Siebel Open UI Manifest as follows: - under `Administration - Application > Manifest Files` >- add a new record with: ><br>**Name:** `siebel/custom/N19_reactdemo_PR.js`

        	- under `Administration - Application > Manifest Administration`

    > - add a new record under **UI Objects** with:
    >   <br>**Name:** `N19 React SIS Account Entry Applet` > <br>**Usage Type:** `Physical Renderer` > <br>**Type:** `Applet`

    > - add a new record under **Object Expression** with:
    >   <br>**Level:** `1`

    > - add a new record under **Files** with:
    >   <br>**Name:** `siebel/custom/N19_reactdemo_PR.js`

9.  Empty browser cache and hard reload
    <br>_(e.g. using Chrome: press F12, then right-click a browser Refresh button and press ‘Empty Cache and Hard Reload’)_
10. Re-login to your Siebel Application.
11. Navigate to the `N19 React` Screen.