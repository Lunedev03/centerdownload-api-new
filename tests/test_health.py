import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from app.main import app_fastapi

client = TestClient(app_fastapi)

def test_health_check():
    res = client.get('/api/v1/health')
    assert res.status_code == 200
    assert res.json()['data']['status'] == 'healthy'
