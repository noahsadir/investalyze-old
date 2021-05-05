# Investalyze
Analytics for stock market and options trading.

## How to Install

#### Note: Instructions assume Node.js and npm are installed.

### Automated Install
 - In the parent folder of where you want to set up the environment, download the following script:
   ```
   wget https://noahsadir.io/resources/scripts/investalyze-react-install.sh
   ```
 - Inspect the script, then run:
   ```
   sh investalyze-react-install.sh
   ```
Alternatively, you can set up the environment manually.

### Manual Install
- Create an empty react app. These instructions assume the app is named "investalyze"
  ```
  npx create-react-app investalyze
  ```
- Navigate to react app and clone repository into temporary directory.
  ```
  cd investalyze
  git clone https://github.com/noahsadir/investalyze-new.git ./tmp
  ```
- Overwrite files created by create-react-app with those from repository, then delete temp folder
  ```
  # RUN COMMANDS BELOW WITH CAUTION
  cp -r tmp/* ./
  rm -r ./tmp
  ```
- Install required packages:
  ```
  # Using Yarn:
  # yarn add [DEPENDENCY]

  @material-ui/core
  @material-ui/lab
  react-split-pane
  fontsource-open-sans
  ```
- (OPTIONAL) Build project or start in test environment to confirm that the code works
  ```
  # BUILD using *ONE* of the following:
  npm run build
  yarn build
  # START using *ONE* of the following:
  npm start
  yarn start
  ```

### Post-configuration Setup

In order to use the APIs, create a file called keys.json in the src folder with the following text:
```
{
  "alpha_vantage": "YOUR_API_KEY_HERE"
}
```

Then, replace YOUR_API_KEY_HERE with a valid API key.
