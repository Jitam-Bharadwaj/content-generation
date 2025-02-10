const readline = require('readline');
const axios = require('axios');
const GeneratorService = require('./services/generatorService');

process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    return;
  }
  console.warn(warning.name, warning.message);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_URL = 'http://localhost:3000';

const COMMANDS = {
  SWITCH: '/switch',
  EXIT: 'exit',
  HELP: '/help',
  HEALTH: '/health',
  MODEL: '/model'
};

const AVAILABLE_MODELS = ['GEMINI', 'OPENAI', 'CALUDE'];

async function showHelp() {
  console.log('\nAvailable commands:');
  console.log('/model  - Switch between AI models');
  console.log('/switch - Switch between modes');
  console.log('/health - Show current system health');
  console.log('exit   - Exit current mode or program');
  console.log('/help  - Show this help message\n');
}

async function displayHealthCheck() {
  try {
    const response = await axios.get(`${API_URL}/api/health`);
    console.log('\nSystem Health Status:');
    console.log('===================');
    console.log(JSON.stringify(response.data.data, null, 2));
    console.log('===================\n');
  } catch (error) {
    console.error('Error fetching health status:', error.message);
  }
}

async function switchModel() {
  return new Promise((resolve) => {
    console.log('\nAvailable Models:');
    AVAILABLE_MODELS.forEach((model, index) => {
      console.log(`${index + 1}. ${model}`);
    });
    
    rl.question('\nSelect model (1-3): ', async (choice) => {
      const modelIndex = parseInt(choice) - 1;
      if (modelIndex >= 0 && modelIndex < AVAILABLE_MODELS.length) {
        try {
          const result = await GeneratorService.switchModel(AVAILABLE_MODELS[modelIndex]);
          console.log(`\n${result}`);
          resolve(true);
        } catch (error) {
          console.error('Error switching model:', error.message);
          resolve(false);
        }
      } else {
        console.log('\nInvalid selection. Using default model.');
        resolve(false);
      }
    });
  });
}

async function handleGeneratorMode() {
  console.clear();
  console.log('\n=== Content Generator Mode ===');
  console.log('Select content type to generate:');
  console.log('1. Keywords');
  console.log('2. Title Suggestions');
  console.log('3. Meta Description');
  console.log('4. Full Content');
  console.log('5. Generate all together');
  console.log('Type "exit" to return to main menu');
  console.log('Type "/help" for available commands\n');

  const generator = async () => {
      try {
          rl.question('Select option (1-5): ', async (option) => {
                if (option.toLowerCase() === COMMANDS.EXIT) {
                    console.clear();
                    showMainMenu();
                    return;
                }

                if (option.toLowerCase() === COMMANDS.HELP) {
                    await showHelp();
                    generator();
                    return;
                }

                if (option.toLowerCase() === COMMANDS.HEALTH) {
                    await displayHealthCheck();
                    generator();
                    return;
                }

                if (option.toLowerCase() === COMMANDS.MODEL) {
                    await switchModel();
                    generator();
                    return;
                }

                let endpoint;
                let prompt;

                switch (option) {
                  case '1':
                      endpoint = '/api/generate/keywords';
                      prompt = 'Enter topic for keyword generation: ';
                      break;
                  case '2':
                      endpoint = '/api/generate/title';
                      prompt = 'Enter topic for title suggestions: ';
                      break;
                  case '3':
                      endpoint = '/api/generate/meta';
                      prompt = 'Enter topic for meta description: ';
                      break;
                  case '4':
                      endpoint = '/api/generate/content';
                      prompt = 'Enter topic for content generation: ';
                      break;
                  case '5':
                      endpoint = '/api/generate/all';
                      prompt = 'Enter topic to generate all content types: ';
                      break;
                  default:
                      console.log('Invalid option. Please choose 1-5.\n');
                      generator();
                      return;
              }

              rl.question(prompt, async (topic) => {
                  try {
                      console.log('\nGenerating content...\n');
                      const response = await axios.post(`${API_URL}${endpoint}`, { topic });
                      
                      console.log('Generated Successfully!\n');
                      console.log(JSON.stringify(response.data.data, null, 2));
                      console.log('\nSelect another option or type "exit" to return to main menu\n');
                  } catch (error) {
                      console.error('Error generating content:', error.response?.data?.error || error.message);
                  }
                  generator();
              });
          });
      } catch (error) {
          console.error('Error in generator mode:', error.message);
          generator();
      }
  };

  generator();
}


async function handleChatMode() {
  console.clear();
  console.log('\n=== Chat Mode ===');
  console.log('Type your message or use commands (/help for list)\n');

  const chat = async () => {
    try {
      rl.question('You: ', async (input) => {
        if (input.toLowerCase() === COMMANDS.EXIT) {
          console.clear();
          showMainMenu();
          return;
        }

        if (input.toLowerCase() === COMMANDS.HELP) {
          await showHelp();
          chat();
          return;
        }

        if (input.toLowerCase() === COMMANDS.HEALTH) {
          await displayHealthCheck();
          chat();
          return;
        }

        if (input.toLowerCase() === COMMANDS.MODEL) {
          await switchModel();
          chat();
          return;
        }

        try {
          const response = await axios.post(`${API_URL}/api/generate/content`, { topic: input });
          console.log('\nAI:', response.data.data, '\n');
        } catch (error) {
          console.error('Error in chat:', error.response?.data?.error || error.message);
        }
        chat();
      });
    } catch (error) {
      console.error('Error in chat mode:', error.message);
      chat();
    }
  };

  chat();
}

async function initialModelSelection() {
  console.log('Welcome to Content Generation CLI!\n');
  console.log('Please select your preferred AI model:');
  await switchModel();
}

async function showMainMenu() {
  console.log('\nAvailable modes:');
  console.log('1. Generator - Generate specific content types');
  console.log('2. Chat - Free conversation mode');
  console.log('Type "exit" to quit the program');
  console.log('Type "/help" for available commands\n');

  const selectMode = () => {
    try {
      rl.question('Select mode (1/2): ', async (mode) => {
        if (mode.toLowerCase() === COMMANDS.EXIT) {
          console.log('Goodbye!');
          rl.close();
          process.exit(0);
        }

        if (mode.toLowerCase() === COMMANDS.HELP) {
          await showHelp();
          selectMode();
          return;
        }

        if (mode.toLowerCase() === COMMANDS.MODEL) {
          await switchModel();
          selectMode();
          return;
        }

        switch (mode) {
          case '1':
            await handleGeneratorMode();
            break;
          case '2':
            await handleChatMode();
            break;
          default:
            console.log('Invalid selection. Please choose 1 or 2.\n');
            selectMode();
        }
      });
    } catch (error) {
      console.error('Error in main menu:', error.message);
      selectMode();
    }
  };

  selectMode();
}

async function startChat() {
  console.clear();
  await initialModelSelection();
  showMainMenu();
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\nGoodbye!');
  rl.close();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  rl.close();
  process.exit(1);
});

module.exports = startChat;