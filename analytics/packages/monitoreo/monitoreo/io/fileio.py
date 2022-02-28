import apache_beam as beam
from apache_beam.io import filesystems


class FlatMatchAllFn(beam.DoFn):
    def process(self, element):
        match_results = filesystems.FileSystems.match(element["files"])

        others = {x: element[x] for x in element if x != "files"}
        for result in match_results:
            for file_metadata in result.metadata_list:
                yield {
                    **others,
                    "path": file_metadata.path,
                    "size_in_bytes": file_metadata.size_in_bytes
                }


class FlatMatchAll(beam.PTransform):
    def expand(self, patterns):
        files = (
            patterns
            | beam.ParDo(FlatMatchAllFn())
        )

        return files
