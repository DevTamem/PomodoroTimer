const { spawn } = require("child_process");
const electron = require("electron");

const child = spawn(electron, process.argv.slice(2), {
  stdio: "inherit",
  env: {
    ...process.env,
    ELECTRON_RUN_AS_NODE: undefined,
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
