import apache_beam as beam
from beam_nuggets.io import relational_db


def db_source_config_from_env_config(env_config):
    try:
        db_params = {
            "database": env_config["PGDATABASE"],
            "host": env_config["PGHOST"],
            "password": env_config["PGPASSWORD"],
            "port": env_config["PGPORT"],
            "username": env_config["PGUSER"],
        }
    except KeyError as exc:
        raise Exception(f"Missing database params: {exc.args}")

    db_source_config = relational_db.SourceConfiguration(
        drivername="postgresql",
        **db_params
    )

    return db_source_config


def db_table_config(name, primary_key_columns):
    table_config = relational_db.TableConfiguration(
        name=name,
        primary_key_columns=primary_key_columns
    )

    return table_config


class Write(beam.PTransform):
    def __init__(self, source_config, table_config):
        super().__init__()
        self.source_config = source_config
        self.table_config = table_config

    def expand(self, rows):
        return (
            rows
            | relational_db.Write(
                source_config=self.source_config,
                table_config=self.table_config
            )
        )
