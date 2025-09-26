using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EvCharging.Api.Domain.Models;

public class Booking
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
}


