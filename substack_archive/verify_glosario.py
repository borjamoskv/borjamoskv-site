#!/usr/bin/env python3
"""
VERIFICATION LINTER: Glossary Integrity and Ontology Audit
Nivel de Realidad: C5-REAL (Script ejecutable de verificación causal)
Autor: Antigravity-Ω / Borja Moskv Site
"""

import sys
import math
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
LEDGER_PATH = PROJECT_DIR / "CORTEX_LEDGER_GLOSARIO.md"
MD_PATH = PROJECT_DIR / "src/content/articles/glosario-ai-tecnologia.md"
MDX_PATH = PROJECT_DIR / "src/content/articles/glosario-ai-tecnologia.mdx"

# List of glossary terms to verify (including references and combined entries)
GLOSSARY_TERMS = [
    "⌨️ CLI — Command Line Interface",
    "⏱️ Latency (Latencia)",
    "☁️ VPS — Servidor Privado Virtual",
    "⚖️ Alignment (Alineamiento)",
    "⚖️ Bias (Sesgo AI)",
    "⚖️ Utilidad vs. Seguridad",
    "⚙️ Sistema de Instrucciones (System Prompt)",
    "⚡ Gemini",
    "⚡ Hugging Face",
    "⚡ Inference (Inferencia)",
    "⚡ KV Cache (Key-Value Cache)",
    "⚡ Post-training (Post-entrenamiento)",
    "✖️ XAI — Explainable AI (IA Explicable)",
    "✨ GEO — Generative Engine Optimization",
    "🌀 Hallucination (Alucinación)",
    "🌊 Emergent Behavior (Comportamiento Emergente)",
    "🌊 Weights (Pesos)",
    "🌡️ Temperatura",
    "🎓 Transfer Learning (Aprendizaje por Transferencia)",
    "🎛️ Fine-tuning",
    "🎨 Diffusion (Modelos de Difusión)",
    "🎨 Negative Prompt",
    "🎪 Hype Cycle (Ciclo de exageración)",
    "🎮 GPU — Unidad de Procesamiento Gráfico",
    "🎯 AEO — Answer Engine Optimization",
    "🎯 Attention (Mecanismo de Atención)",
    "🎵 Vibe Coding",
    "🎼 Orquestador",
    "🏋️ RLHF — Reinforcement Learning from Human Feedback",
    "🐝 Sub-agente",
    "🐧 Linux",
    "👁️ Multimodal",
    "👁️ Vision Models (Modelos de Visión) / VLM — Vision-Language Model",
    "👤 Human-in-the-Loop (HITL)",
    "👥 Multi-agente",
    "💀 Model Collapse",
    "💬 NLP — Natural Language Processing",
    "💬 Prompt",
    "💰 Cost per Token",
    "💾 Memory (Memoria en Agentes)",
    "📂 Dataset",
    "📈 Throughput (Rendimiento)",
    "📊 Data Pipeline (Tubería de Datos)",
    "📊 Evals (Evaluaciones)",
    "📊 Métricas AI",
    "📋 Parámetros",
    "📏 Benchmark",
    "📐 Infraestructura AI",
    "📐 Scaling Laws (Leyes de Escalado)",
    "📚 Corpus",
    "📚 RAG — Retrieval Augmented Generation",
    "📦 Batch Processing",
    "📦 Few-shot Prompting / Few-shot / Zero-shot / One-shot",
    "📦 Modelo",
    "📱 Edge AI",
    "🔁 Agentic Workflow",
    "🔄 Feedback Loop",
    "🔄 Loop de razonamiento / ReAct",
    "🔄 RLAIF (Reinforcement Learning from AI Feedback)",
    "🔄 Router (en IA)",
    "🔌 AI Wrapper",
    "🔌 API — Application Programming Interface",
    "🔍 Perplexity",
    "🔍 Semantic Search (Búsqueda Semántica)",
    "🔒 PII (Personally Identifiable Information)",
    "🔒 Privacidad Diferencial",
    "🔒 VPN — Red Privada Virtual",
    "🔓 Jailbreak",
    "🔓 Open Source (Código Abierto)",
    "🔗 LangChain / LangGraph",
    "🔗 MCP — Model Context Protocol",
    "🔥 Function Calling",
    "🔧 Tool / Herramienta (AI)",
    "🔧 Training (Entrenamiento)",
    "🔬 SWE-bench",
    "🔬 Safety AI (Seguridad en IA)",
    "🖥️ Copilot",
    "🖥️ Terminal / Línea de comandos",
    "🗂️ Knowledge Graph",
    "🗂️ LoRA (Low-Rank Adaptation)",
    "🗄️ Servidor",
    "🗜️ Context Window / Ventana de Contexto",
    "🗜️ Distillation (Destilación)",
    "🗜️ Quantization (Cuantización)",
    "🗜️ Zipf y Tokenización",
    "🗺️ Embedding",
    "🚀 Knowledge Cutoff (Fecha de Corte de Conocimiento)",
    "🛑 Stop Sequences (Secuencias de Parada)",
    "🛡️ Constitutional AI",
    "🛡️ Guardrails",
    "🟠 Anthropic",
    "🟢 OpenAI",
    "🤖 Antropomorfismo",
    "🤖 Inteligencia Artificial (AI / IA)",
    "🤖 NVIDIA",
    "🤖 Robot Process Automation (RPA)",
    "🤝 A2A — Agent-to-Agent Protocol",
    "🦞 OpenClaw",
    "🦠 Prompt Injection",
    "🦾 Agente AI",
    "🧠 Chain-of-Thought (CoT)",
    "🧠 In-Context Learning (ICL)",
    "🧠 LLM — Large Language Model",
    "🧠 Neural Network (Red Neuronal)",
    "🧠 OpenAI o1 / o3 / Reasoning Models (Modelos de Razonamiento)",
    "🧠 Transformer",
    "🧩 Mixture of Experts (MoE)",
    "🧩 RAM — Memoria de Acceso Aleatorio",
    "🧩 Skill (Habilidad de Agente)",
    "🧬 AI Constitucional (Constitutional AI)",
    "🧬 Synthetic Data (Datos Sintéticos)",
    "🧭 Observability (Observabilidad)",
    "🧭 Overfitting (Sobreajuste)",
    "🧮 Compute (Cómputo)",
    "🧮 Embedding Model (Modelo de Embedding)",
    "🧮 Machine Learning (ML)",
    "🧰 Vector Database (Base de Datos Vectorial)",
    "🧱 Context Engineering",
    "🪙 Token",
    "🪙 Tokenization (Tokenización)",
    "🪞 AGI — Artificial General Intelligence"
]

def calculate_shannon_entropy(data_bytes):
    if not data_bytes:
        return 0.0
    length = len(data_bytes)
    frequencies = {}
    for byte in data_bytes:
        frequencies[byte] = frequencies.get(byte, 0) + 1
    entropy = 0.0
    for count in frequencies.values():
        p = count / length
        entropy -= p * math.log2(p)
    return entropy

def verify_glossary():
    print("=========================================================")
    print("Ω-LINTER: INICIANDO AUDITORÍA DEL GLOSARIO (C5-REAL)")
    print("=========================================================")
    
    status = {}
    status["CORTEX_LEDGER_GLOSARIO.md"] = LEDGER_PATH.exists()
    status["glosario-ai-tecnologia.md"] = MD_PATH.exists()
    status["glosario-ai-tecnologia.mdx"] = MDX_PATH.exists()
    
    print("1. Ficheros del Glosario:")
    for name, exists in status.items():
        state = "[OK]" if exists else "[NOT FOUND]"
        print(f"   - {name:<28}: {state}")
        
    all_files_exist = all(status.values())
    if not all_files_exist:
        print("\n[ERROR] Faltan ficheros requeridos para completar la auditoría.")
        sys.exit(1)
        
    # 2. Shannon Entropy Audit
    print("\n2. Entropía de Shannon:")
    with open(MD_PATH, "rb") as f:
        bytes_content = f.read()
    entropy = calculate_shannon_entropy(bytes_content)
    size = len(bytes_content)
    print(f"   - glosario-ai-tecnologia.md  : Size={size} bytes, Entropy={entropy:.4f} bits/byte")
    if entropy < 3.5:
        print("     [WARN] Entropía inferior al umbral de exergía mínima (3.5 bits/byte).")
    else:
        print("     [SUCCESS] Entropía por encima del umbral mínimo.")
        
    # 3. Term Presence Verification
    print("\n3. Verificación de Presencia de Términos (121 requeridos):")
    with open(MD_PATH, "r", encoding="utf-8") as f:
        md_text = f.read()
        
    found_count = 0
    missing_terms = []
    
    for term in GLOSSARY_TERMS:
        # Check direct presence
        if term in md_text:
            found_count += 1
        else:
            missing_terms.append(term)
            
    print(f"   - Términos encontrados    : {found_count} / {len(GLOSSARY_TERMS)}")
    if missing_terms:
        print("     [WARN] Términos faltantes:")
        for m in missing_terms:
            print(f"       * {m}")
        sys.exit(1)
    else:
        print("     [SUCCESS] Todos los 121 términos/referencias están presentes y mapeados.")
        
    print("=========================================================")
    print("AUDITORÍA DE INTEGRIDAD COMPLETADA CON ÉXITO")
    print("=========================================================")

if __name__ == "__main__":
    verify_glossary()
