#! /bin/bash

cd packages/hardhat
npx hardhat deploy --network hardhat

cd ../server
npx ts-node testRootInviteGen.ts

cd ../react-app
npm start

