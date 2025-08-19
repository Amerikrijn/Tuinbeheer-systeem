# 🚀 AI Pipeline v2.0

**AI-Powered Pipeline for Testing, Orchestration, and Code Fixing**

Een slimme pipeline die meerdere AI agents laat samenwerken om je code te verbeteren tot het perfect is!

## ✨ Features

### 🤖 **Multiple AI Agents**
- **Issue Collector** (OpenAI GPT-4) - Vindt code problemen
- **Test Generator** (Anthropic Claude) - Schrijft tests
- **Code Fixer** (GitHub Copilot) - Lost problemen op
- **Quality Validator** (OpenAI GPT-4) - Valideert fixes

### 🔄 **Continue Loop**
- Pipeline blijft draaien tot code kwaliteit perfect is
- Automatische iteraties met kwaliteitsverbetering
- Intelligente stop criteria

### 🎯 **Smart Orchestration**
- Agents werken samen
- Automatische error handling
- Progress tracking
- Resultaten opslaan

## 🚀 Quick Start

### **1. Installatie**
```bash
cd agents/ai-pipeline-v2
npm install
```

### **2. API Keys Instellen**
```bash
export OPENAI_API_KEY="sk-your-openai-key"
export ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"
export GITHUB_TOKEN="ghp-your-github-token"
```

### **3. Pipeline Starten**
```bash
# Basis pipeline
npm start -- run

# Met custom instellingen
npm start -- run --target ./src --iterations 15 --quality 95

# Met auto-apply
npm start -- run --auto-apply
```

## 📖 Gebruik

### **Pipeline Commando's**
```bash
# Pipeline uitvoeren
ai-pipeline run [options]

# Configuratie beheren
ai-pipeline config --init
ai-pipeline config --show

# Agents beheren
ai-pipeline agents --list
ai-pipeline agents --status
```

### **CLI Opties**
```bash
Options:
  -t, --target <path>        Target directory (default: ./src)
  -i, --iterations <number>  Maximum iterations (default: 10)
  -q, --quality <number>     Quality threshold 0-100 (default: 90)
  -o, --output <path>        Output directory (default: ./ai-pipeline-results)
  --auto-apply               Automatically apply fixes
  --git-integration          Enable Git integration
  --config <path>            Configuration file path
```

## 🏗️ Architectuur

### **Pipeline Flow**
```
1. 🔍 Issue Collector (OpenAI)
   ↓
2. 🧪 Test Generator (Claude)  
   ↓
3. 🔧 Code Fixer (Copilot)
   ↓
4. ✅ Quality Validator (OpenAI)
   ↓
5. 🔄 Repeat until perfect
```

### **Continue Loop Logica**
```typescript
while (qualityScore < threshold && iteration < maxIterations) {
  // 1. Collect issues
  // 2. Generate tests
  // 3. Fix code
  // 4. Validate fixes
  // 5. Check quality
  // 6. Repeat if needed
}
```

## ⚙️ Configuratie

### **Default Config**
```json
{
  "agents": [
    {
      "id": "issue-collector",
      "name": "Issue Collector",
      "enabled": true,
      "provider": "openai"
    },
    {
      "id": "test-generator", 
      "name": "Test Generator",
      "enabled": false,
      "provider": "anthropic"
    }
  ],
  "maxIterations": 10,
  "qualityThreshold": 90,
  "autoApply": false,
  "gitIntegration": false
}
```

### **Configuratie Bestand Maken**
```bash
ai-pipeline config --init
```

## 🔧 Development

### **Scripts**
```bash
npm run build          # TypeScript compiler
npm run dev            # Watch mode
npm run test           # Run tests
npm run pipeline       # Run pipeline directly
```

### **Agent Development**
```bash
# Test individuele agents
npm run agent:issue-collector
npm run agent:test-generator
npm run agent:code-fixer
npm run agent:quality-validator
```

## 📊 Output

### **Resultaten**
- **JSON output** in `./ai-pipeline-results/`
- **Pipeline results** met metrics
- **Agent results** per agent
- **Quality scores** per iteratie

### **Voorbeeld Output**
```json
{
  "success": true,
  "iterations": 3,
  "finalQualityScore": 95.2,
  "issuesFound": 12,
  "issuesFixed": 10,
  "testsGenerated": 8,
  "executionTime": 45000
}
```

## 🚨 Troubleshooting

### **Veelvoorkomende Problemen**

#### **1. API Key Error**
```bash
Error: OPENAI_API_KEY environment variable is required
```
**Oplossing**: Zet je API key in environment
```bash
export OPENAI_API_KEY="sk-your-key"
```

#### **2. Agent Not Available**
```bash
Error: OpenAI provider not available
```
**Oplossing**: Check API key en internet verbinding

#### **3. High API Costs**
**Oplossing**: 
- Verlaag `maxIterations`
- Verhoog `qualityThreshold`
- Gebruik `--target` voor specifieke directories

## 🔮 Toekomstige Features

### **Phase 2: Advanced Agents**
- **Anthropic Claude** integratie
- **GitHub Copilot** integratie
- **Multi-language** support

### **Phase 3: CI/CD Integration**
- **GitHub Actions** workflow
- **GitLab CI** integratie
- **Jenkins** plugin

### **Phase 4: Machine Learning**
- **Pattern learning** van fixes
- **Confidence scoring** verbetering
- **Auto-optimization** van prompts

## 🤝 Contributing

1. Fork de repository
2. Maak feature branch
3. Commit je changes
4. Push naar branch
5. Maak Pull Request

## 📄 License

MIT License - zie [LICENSE](LICENSE) voor details

---

**Gebouwd met ❤️ door AI Testing System**