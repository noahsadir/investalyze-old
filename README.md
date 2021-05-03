# Investalyze
Analytics for stock market and options trading.

## How to install
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
- Install required packages using
  ```
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
