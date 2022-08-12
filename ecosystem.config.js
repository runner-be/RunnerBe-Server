module.exports = {
  apps: [
    {
      name: "runnerbeApp",
      script: "./index.js",
      instances: 0,
      exec_mode: "cluster",
    },
  ],
};
