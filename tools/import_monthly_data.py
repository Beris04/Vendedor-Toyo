"""Plantilla de importación mensual a Supabase.
Instalar: pip install pandas openpyxl supabase
Uso: python import_monthly_data.py ventas_julio.xlsx
"""
import os, sys, pandas as pd
from supabase import create_client
SUPABASE_URL=os.environ.get('SUPABASE_URL')
SUPABASE_KEY=os.environ.get('SUPABASE_SERVICE_KEY')
if not SUPABASE_URL or not SUPABASE_KEY:
    raise SystemExit('Define SUPABASE_URL y SUPABASE_SERVICE_KEY en variables de entorno.')
if len(sys.argv)<2:
    raise SystemExit('Uso: python import_monthly_data.py archivo.xlsx')
client=create_client(SUPABASE_URL,SUPABASE_KEY)
path=sys.argv[1]
df=pd.read_excel(path)
print('Columnas detectadas:', list(df.columns))
# TODO: mapear columnas: cliente_codigo, cliente_nombre, producto_codigo, descripcion, categoria, año, mes, dia, piezas, subtotal, agente
# client.table('ventas_historial').insert(records).execute()
print('Plantilla lista. Revisar mapeo antes de ejecutar carga real.')
