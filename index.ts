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
    image: '/path/to/fullscreen.png'
});
sendCommand({
    command: 'draw_partial',
    image: '/path/to/partial.png',
    x: 100,
    y: 100,
    width: 200,
    height: 200
});

// Cleanup when done
process.on('exit', () => {
    epdProcess.kill();
});