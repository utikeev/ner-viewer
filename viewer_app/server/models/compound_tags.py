import logging
from typing import List

from viewer_app.server.models.tags import TaggedEntity

LOG = logging.getLogger('ner.viewer.compound_tagger')


def split_to_compound_tags(tags: List[TaggedEntity]) -> List[TaggedEntity]:
    tags = sorted(tags)
    result: List[TaggedEntity] = []
    processed = 0
    for i in range(len(tags)):
        start = tags[i].start
        end = tags[i].end
        text = tags[i].text
        l_tags = tags[i].tags
        l_ids = tags[i].ids
        got_conflict = False
        for j in range(i + 1, len(tags)):
            o_start = tags[j].start
            o_end = tags[j].end
            o_l_tags = tags[j].tags
            o_text = tags[j].text
            o_ids = tags[j].ids
            if end >= o_end:
                # [ ( ) ]
                got_conflict = True
                if o_start > processed and start != o_start:
                    result.append(TaggedEntity(l_tags, start, o_start, text[:o_start - start], l_ids))
                    processed = o_start
                if o_end > processed:
                    result.append(TaggedEntity(l_tags + o_l_tags, o_start, o_end, text[o_start - start:o_end - start], {**l_ids, **o_ids}))
                    processed = o_end
                if end != o_end:
                    result.append(TaggedEntity(l_tags, o_end, end, text[o_end - start:], l_ids))
            elif end > o_start:
                # [ ( ] )
                got_conflict = True
                if o_start > processed and start != o_start:
                    result.append(TaggedEntity(l_tags, start, o_start, text[:o_start - start], l_ids))
                    processed = o_start
                if end > processed:
                    result.append(TaggedEntity(l_tags + o_l_tags, o_start, end, text[o_start - start:end - start], {**l_ids, **o_ids}))
                    processed = end
                if o_end > processed:
                    tags[j] = TaggedEntity(o_l_tags, processed, o_end, o_text[processed - o_start:], o_ids)
            else:
                break
        if not got_conflict and start >= processed:
            result.append(tags[i])
    return result
