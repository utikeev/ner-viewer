from typing import NamedTuple, List, Optional, Set, Dict


class NormalizedEntity(NamedTuple):
    tag: str
    text: str
    id: Optional[str]


class TaggedEntity(NamedTuple):
    tags: List[str]
    start: int
    end: int
    text: str
    ids: Dict[str, Optional[str]]

    def __lt__(self, other):
        if self.start == other.start:
            return self.end < other.end
        return self.start < other.start
