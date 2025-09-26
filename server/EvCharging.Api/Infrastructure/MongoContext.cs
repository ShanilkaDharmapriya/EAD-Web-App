using MongoDB.Driver;
using EvCharging.Api.Domain.Models;

namespace EvCharging.Api.Infrastructure;

public class MongoContext
{
    private readonly IMongoDatabase _database;

    public MongoContext(MongoSettings settings)
    {
        var client = new MongoClient(settings.ConnectionString);
        _database = client.GetDatabase(settings.DatabaseName);
    }

    public IMongoDatabase Database => _database;

    public IMongoCollection<Owner> Owners => _database.GetCollection<Owner>("owners");
    public IMongoCollection<Station> Stations => _database.GetCollection<Station>("stations");
    public IMongoCollection<Booking> Bookings => _database.GetCollection<Booking>("bookings");
}


