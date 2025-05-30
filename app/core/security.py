# app/core/security.py - Módulo para funcionalidades de segurança e autenticação.

# from fastapi import Security, HTTPException, status
# from fastapi.security.api_key import APIKeyHeader

API_KEY_HEADER_NAME = "X-API-Key"
api_key_header_scheme = APIKeyHeader(name=API_KEY_HEADER_NAME, auto_error=True)

# VALID_API_KEYS = {"chave_secreta_valida": "Cliente Valido"} # Carregar de env vars/config

async def verificar_api_key(api_key: str = Security(api_key_header_scheme)):
#     '''Dependência para verificar API Key.'''
#     # if api_key in VALID_API_KEYS:
#     #     return VALID_API_KEYS[api_key]
#     # else:
#     #     raise HTTPException(
#     #         status_code=status.HTTP_403_FORBIDDEN,
#     #         detail="Chave de API inválida ou ausente."
#     #     )
#     # Simulação para o exercício:
    if api_key == "chave_teste_valida":
        print(f"API Key '{api_key}' verificada (simulado).")
        return {"client_name": "Cliente de Teste Valido"}
    else:
        print(f"API Key '{api_key}' inválida (simulado) - levantaria HTTPException.")
        # Para o exercício, não vamos levantar a exceção para permitir que o fluxo continue
        # mas em um caso real, a exceção abaixo seria levantada:
        # raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chave de API inválida.")
        # Retornamos um valor default para a simulação não quebrar chamadas.
        return {"client_name": "Cliente Simulado Bloqueado"}

print("Módulo de segurança (app/core/security.py) com esquema de API Key conceitualmente definido.")
