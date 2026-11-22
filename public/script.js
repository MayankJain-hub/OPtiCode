const analyzeBtn = document.getElementById('analyzeBtn');
const sampleBtn = document.getElementById('sampleBtn');
const clearBtn = document.getElementById('clearBtn');
const themeToggle = document.getElementById('themeToggle');
const logoutBtn = document.getElementById('logoutBtn');
const codeInput = document.getElementById('codeInput');
const language = document.getElementById('language');
const userName = document.getElementById('userName');

const results = document.getElementById('results');
const placeholder = document.getElementById('placeholder');
const score = document.getElementById('score');
const metricsList = document.getElementById('metricsList');
const issuesList = document.getElementById('issuesList');
const suggestionsList = document.getElementById('suggestionsList');
const originalCode = document.getElementById('originalCode');
const optimizedCode = document.getElementById('optimizedCode');

const samples = {
  javascript: `function check(arr) {
  let temp = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[i] == true) {
        console.log(arr[i]);
      }
    }
  }


  return temp;;
}`,
  python: `def check(nums):
    temp = 0
    for i in range(len(nums)):
        for j in range(len(nums)):
            if nums[i] == True:
                print(nums[i])


    return temp`,
  java: `public class Demo {
    public static void main(String[] args) {
        int temp = 0;
        for(int i=0;i<10;i++) {
            for(int j=0;j<10;j++) {
                if(true == true) {
                    System.out.println(i + j);
                }
            }
        }
        System.out.println(temp);;
    }
}`,
  cpp: `#include <iostream>
using namespace std;
int main() {
    int temp = 0;
    for(int i=0;i<10;i++) {
        for(int j=0;j<10;j++) {
            if(true == true) {
                printf("%d", i+j);
            }
        }
    }
    return 0;;
}`,
  c: `#include <stdio.h>
int main() {
    int temp = 0;
    for(int i=0;i<10;i++) {
        for(int j=0;j<10;j++) {
            if(1 == true) {
                printf("%d", i+j);
            }
        }
    }
    return 0;;
}`
};

(async function loadUser() {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      window.location.href = '/';
      return;
    }
    const data = await response.json();
    userName.textContent = data.user.name;
  } catch {
    window.location.href = '/';
  }
})();

sampleBtn.addEventListener('click', () => {
  codeInput.value = samples[language.value];
});

clearBtn.addEventListener('click', () => {
  codeInput.value = '';
  results.classList.add('hidden');
  placeholder.classList.remove('hidden');
  originalCode.textContent = '';
  optimizedCode.textContent = '';
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
});

analyzeBtn.addEventListener('click', async () => {
  const code = codeInput.value.trim();
  if (!code) {
    alert('Please paste some code first.');
    return;
  }

  analyzeBtn.textContent = 'Analyzing...';
  analyzeBtn.disabled = true;

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language: language.value })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to analyze code');

    placeholder.classList.add('hidden');
    results.classList.remove('hidden');

    score.textContent = `${data.score}/100`;
    originalCode.textContent = code;
    optimizedCode.textContent = data.optimizedCode;

    metricsList.innerHTML = '';
    Object.entries(data.metrics).forEach(([key, value]) => {
      const li = document.createElement('li');
      li.textContent = `${formatKey(key)}: ${value}`;
      metricsList.appendChild(li);
    });

    issuesList.innerHTML = '';
    data.issues.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      issuesList.appendChild(li);
    });

    suggestionsList.innerHTML = '';
    data.suggestions.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      suggestionsList.appendChild(li);
    });
  } catch (error) {
    alert(error.message);
    if (error.message.toLowerCase().includes('log in')) {
      window.location.href = '/';
    }
  } finally {
    analyzeBtn.textContent = 'Analyze Code';
    analyzeBtn.disabled = false;
  }
});

function formatKey(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, c => c.toUpperCase());
}
