
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
    def __init__(self, include_extras=False):
        self.include_extras = include_extras

    def expand(self, patterns):
        files = (
            patterns
            | beam.ParDo(FlatMatchAllFn())
            # | beam.FlatMap(lambda x: x)
            # | beam.FlatMap(self._match_all)
            # # | beam.FlatMap(lambda x: x)
        )

        return files

    def _match_all(self, element):
        def map_match(match, extras):
            return {
                **extras,
                "path": match.path,
                "size_in_bytes": match.size_in_bytes
            }

        match_results = filesystems.FileSystems.match(element["patterns"])

        if (self.include_extras):
            extras = {x: element[x] for x in element if x != "patterns"}
        else:
            extras = {}

        files = [[map_match(match, extras) for match in result.metadata_list]
                 for result in match_results]

        return files
