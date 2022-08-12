module.exports = {
  apps: [
    {
      name: "runnerbeApp",
      script: "./index.js",
      instances: max,
      exec_mode: "cluster",
      wait_ready: true, // load하기 전에 ready
      listen_timeout: 50000,
      kill_timeout: 5000, // SIGINT -> SIGKILL 전송까지의 시간
    },
  ],
};
