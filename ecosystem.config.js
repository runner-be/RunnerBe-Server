module.exports = {
  apps: [
    {
      name: "runnerbeApp",
      script: "./index.js",
      instances: 0,
      exec_mode: "cluster",
      wait_ready: true, // load하기 전에 ready
      kill_timeout: 5000, // SIGINT -> SIGKILL 전송까지의 시간
    },
  ],
};
