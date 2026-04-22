const { spawn } = require("child_process");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");

/**
 * Run a Python bridge script, sending JSON via stdin and receiving JSON via stdout.
 *
 * @param {string} scriptName  – Filename inside project_root/model/, e.g. "predict_bridge.py"
 * @param {object} payload     – JSON-serialisable object to send to the script
 * @returns {Promise<object>}  – Parsed JSON from the script stdout
 */
function runPython(scriptName, payload = {}) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(PROJECT_ROOT, "model", scriptName);
    const proc = spawn("python", [scriptPath], {
      cwd: PROJECT_ROOT,
      env: { ...process.env },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            `Python script "${scriptName}" exited with code ${code}.\n${stderr || stdout}`
          )
        );
      }

      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          return reject(new Error(result.error));
        }
        resolve(result);
      } catch {
        reject(new Error(`Failed to parse Python output: ${stdout}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn Python: ${err.message}`));
    });

    // Send the payload to stdin and close the stream
    proc.stdin.write(JSON.stringify(payload));
    proc.stdin.end();
  });
}

module.exports = { runPython };
