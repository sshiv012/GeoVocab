from sqlalchemy import Column, String, Index
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class GeoHashEntity(Base):
    __tablename__ = 'GeoHashEntity'

    hashVal = Column(String, primary_key=True)
    word = Column(String, nullable=False)

    __table_args__ = (
        Index('idx_word', 'word'),
    )

    def to_dict(self):
        return {
            'hashVal': self.hashVal,
            'word': self.word
        }

class GeoVocabPremium(Base):
    __tablename__ = 'GeoVocabPremium'

    geoHash = Column(String, primary_key=True)
    magicwords = Column(String, nullable=False)

    __table_args__ = (
        Index('idx_magicwords', 'magicwords'),
    )

    def to_dict(self):
        return {
            'geoHash': self.geoHash,
            'magicwords': self.magicwords
        }
