# 🚀 AI Pipeline v2.0 - AI-Powered Code Quality Pipeline

Een krachtige pipeline die AI agents gebruikt om code te analyseren, testen te genereren, en automatisch te verbeteren.

## 🎯 **Wat Het Doet**

- **🔍 Issue Collector** - Vindt code problemen met AI
- **🔧 Code Fixer** - Genereert en past fixes toe met AI
- **🧪 Test Generator** - Maakt test cases met AI
- **✅ Quality Validator** - Valideert fixes en berekent kwaliteit
- **🔄 Continue Loop** - Blijft verbeteren tot target kwaliteit

## ⚙️ **Configuratie**

### **1. Configuratie Bestand**

Maak een `config/pipeline-config.yml` bestand aan:

```yaml
# LLM Provider
llm:
  provider: "openai"        # openai, claude, copilot (toekomst)
  model: "gpt-4"           # gpt-4, gpt-3.5-turbo
  api_key: "${OPENAI_API_KEY}"
  temperature: 0.1          # Laag voor consistente fixes

# Kwaliteit Instellingen
quality:
  threshold: 85             # Minimale kwaliteit score (0-100)
  max_iterations: 5         # Maximum verbeterings cycli
  auto_apply_fixes: true    # Automatisch fixes toepassen
  require_validation: true  # AI validatie vereist

# Agents Configuratie
agents:
  issue_collector:
    enabled: true
    focus: ["security", "performance", "quality", "typescript"]
  
  code_fixer:
    enabled: true
    confidence_threshold: 70  # Alleen fixes met 70%+ vertrouwen
  
  test_generator:
    enabled: true
    test_framework: "jest"
  
  quality_validator:
    enabled: true
    validation_mode: "ai"
```

### **2. Environment Variables**

```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

### **3. Pipeline Uitvoeren**

```bash
# Basis pipeline
npm start -- run --target ./src

# Met custom instellingen
npm start -- run \
  --target ./src \
  --iterations 10 \
  --quality 90 \
  --config ./my-config.yml
```

## 🎛️ **Configuratie Opties**

### **LLM Providers**
- **OpenAI** - GPT-4, GPT-3.5-turbo
- **Claude** - Anthropic Claude (toekomst)
- **GitHub Copilot** - GitHub Copilot (toekomst)

### **Focus Instellingen**
- **Security** - Beveiligings issues
- **Performance** - Performance problemen
- **Quality** - Code kwaliteit
- **TypeScript** - Type veiligheid

### **Test Frameworks**
- **Jest** - JavaScript/TypeScript testing
- **Mocha** - Flexible testing framework
- **Vitest** - Fast Vite-based testing

### **Kwaliteit Thresholds**
- **50-70** - Basis kwaliteit
- **70-85** - Goede kwaliteit
- **85-95** - Uitstekende kwaliteit
- **95+** - Productie-ready

## 🔧 **Pipeline Commando's**

```bash
# Pipeline uitvoeren
npm start -- run [options]

# Configuratie beheren
npm start -- config --init      # Maak default config
npm start -- config --show      # Toon huidige config
npm start -- config --set key=value

# Agent status
npm start -- agents --list      # Toon beschikbare agents
npm start -- agents --status    # Check agent status
```

## 📊 **Resultaten Bekijken**

### **Pipeline Results**
```json
{
  "success": true,
  "iterations": 3,
  "finalQualityScore": 87.5,
  "issuesFound": 24,
  "issuesFixed": 18,
  "testsGenerated": 15,
  "executionTime": 45000
}
```

### **Output Bestanden**
- `ai-pipeline-results/` - Pipeline resultaten
- `ai-pipeline-tests/` - Gegenereerde test bestanden
- `ai-pipeline-backups/` - Backups van gewijzigde bestanden

## 🚨 **Troubleshooting**

### **OpenAI API Key Probleem**
```bash
❌ OPENAI_API_KEY environment variable is required

# Oplossing:
export OPENAI_API_KEY="your-key-here"
```

### **Configuratie Probleem**
```bash
❌ Failed to load config

# Oplossing: Check YAML syntax in config/pipeline-config.yml
```

### **Agent Problemen**
```bash
❌ Agent not available

# Oplossing: Check agent config in pipeline-config.yml
```

## 🔮 **Toekomstige Features**

- **Multi-LLM Support** - Verschillende AI providers per agent
- **Git Integration** - Automatische commits en branches
- **CI/CD Integration** - GitHub Actions, GitLab CI
- **Custom Prompts** - Eigen AI prompts per agent
- **Plugin System** - Uitbreidbare agent architectuur

## 📚 **Meer Informatie**

- **Configuratie**: `config/pipeline-config.yml`
- **Types**: `src/types/index.ts`
- **Agents**: `src/agents/`
- **Core**: `src/core/`

## 🤝 **Bijdragen**

1. Fork de repository
2. Maak een feature branch
3. Commit je wijzigingen
4. Push naar de branch
5. Open een Pull Request

## 📄 **Licentie**

MIT License - zie LICENSE bestand voor details.