#!/usr/bin/env python
"""
Script para configurar o ambiente Python para a API
"""
import subprocess
import sys

def check_python_version():
    """Verifica se a versão do Python é compatível"""
    print(f"Versão do Python: {sys.version}")
    if sys.version_info < (3, 9):
        print("ERRO: É necessário Python 3.9 ou superior")
        return False
    return True

def install_dependencies():
    """Instala as dependências necessárias com versões específicas"""
    dependencies = [
        "fastapi>=0.100.0",
        "pydantic>=2.0.0",
        "uvicorn>=0.22.0",
        "python-multipart",
        "aiofiles",
        "yt-dlp"
    ]
    
    print("Instalando dependências...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
        subprocess.check_call([sys.executable, "-m", "pip", "install"] + dependencies)
        print("Dependências instaladas com sucesso!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Erro ao instalar dependências: {e}")
        return False

def main():
    """Função principal"""
    print("Configurando ambiente Python para API...")
    
    if not check_python_version():
        sys.exit(1)
    
    if not install_dependencies():
        sys.exit(1)
    
    print("\nAmbiente configurado com sucesso!")
    print("Para iniciar a API, execute: python -m uvicorn app.main:app --reload")

if __name__ == "__main__":
    main() 