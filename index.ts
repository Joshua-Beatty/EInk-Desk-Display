const { spawn } = require('child_process');
const epdProcess = spawn('python3', ['epd_handler.py']);

epdProcess.stdout.on('data', (data) => {
    console.log('EPD Handler:', data.toString());
});

epdProcess.stderr.on('data', (data) => {
    console.error('EPD Error:', data.toString());
});

function sendCommand(command) {
    epdProcess.stdin.write(JSON.stringify(command) + '\n');
}

// Example usage:
sendCommand({ command: 'clear' });
sendCommand({ 
    command: 'draw',
    image: './test.png'
});
sendCommand({
    command: 'draw_partial',
    image: './test1.png',
    x: 0,
    y: 0,
    width: 800,
    height: 480
});

// Cleanup when done
process.on('exit', () => {
    epdProcess.kill();
});