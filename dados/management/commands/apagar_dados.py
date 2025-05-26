from django.core.management import BaseCommand
from django.db import connection, transaction



class Command(BaseCommand):
   help = "Redefine o sistema, apagando tudo(dados) do banco"

   @transaction.atomic
   def handle(self, *args, **options):
      cursor = connection.cursor()

      app_label = ["alimentos"]
      tables = [
         table
         for table in connection.introspection.table_names()
         if any(app in table for app in app_label)
      ]

      if connection.vendor == "postgresql":
         for table in tables:
               cursor.execute(f'ALTER TABLE "{table}"DISABLE TRIGGER ALL')

      for table in tables:
         cursor.execute(f'TRUNCATE TABLE "{table}" RESTART IDENTITY CASCADE')

      if connection.vendor == "postgresql":
         for table in tables:
               cursor.execute(
                  f"""
                  SELECT setval(pg_get_serial_sequence('"{table}"', 'id'), 1, false)
                     WHERE EXISTS (
                     SELECT 1 FROM information_schema.columns
                     WHERE table_name = '"{table}"' AND column_name = 'id'
                     AND column_default LIKE 'nextval%'
                  );
               """
               )

      if connection.vendor == "postgresql":
         for table in tables:
               cursor.execute(f'ALTER TABLE "{table}" ENABLE TRIGGER ALL;')

      self.stdout.write(self.style.WARNING("Banco de dados limpo com sucesso!"))
      