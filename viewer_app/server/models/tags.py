from typing import NamedTuple, List


class NormalizedEntity(NamedTuple):
    tag: str
    text: str


class TaggedEntity(NamedTuple):
    tags: List[str]
    start: int
    end: int
    text: str

    def __lt__(self, other):
        if self.start == other.start:
            return self.end < other.end
        return self.start < other.start
