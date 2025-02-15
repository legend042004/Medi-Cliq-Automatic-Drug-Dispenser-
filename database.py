import psycopg2

DATABASE_URL = "postgresql://neondb_owner:npg_i4wZVSft0bQj@ep-rough-brook-a8m1z80v-pooler.eastus2.azure.neon.tech/neondb?sslmode=require"

try:
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()


    cursor.execute("SELECT id,name,quantity from medicines where prescribed='FALSE';")
    records=cursor.fetchall()
   
    medicine=[{"id":row[0],"name":row[1],"quantity":row[2]} for row in records]
        
    print(medicine)
    cursor.close()
    conn.close()

except Exception as e:
    print("Error:", e)
