# Introduction

In this tutorial, we will demonstrate how to utilize MongoDB aggregation, filtering, and sorting operations to discover trends and analytics in datasets. This particular dataset contains a list of businesses and their associated reviews.

Our focus here is to understand the overall sentiment/performance for each particular business, and understand their speciality. To accomplish this, we’ll analyze text from customer review datasets to determine the overall sentiment of an individual review, as well as custom entities such as repair type (Engine, Glass, Body), vehicle make/model, references to an individual mechanic, etc. The resulting metadata can then be queried, and filtered by location and sentiment.

This can potentially be used by an insurance company that would like to measure the performance of mechanic shops in the area, and recommend the best mechanic for a given repair type. 


## Prerequisites
Before starting this tutorial, you’ll need the following prerequisites installed on your system
Python 3.5+
Pip
Jupyter Notebook Environment

## Estimated time
This tutorial should take you 10 to 15 minutes to complete.

# Notebook Flow

## Install & import pip packages
We’ll begin by 
pymongo (python mongo client)
plotly (graphing package)
Ipyleaflet (mapping library)
Geopy (geolocation library, converts address to coordinates)

## Load json data
After the pip packages have been installed and imported, we’ll then load reviews and business data as collections using `insert_many`.

We’ll also create an index in the businesses object using the location field. This is necessary to make queries using the “$geoNear” method. 

```
db.businesses_collection.create_index([("location", GEOSPHERE)])
```

## Filter through datasets
Once the datasets have been inserted into the collections, we can then use the `find` selector to print datasets that match a specific condition.

First, we’ll use `find` to query all reviews like so
```
r = db.reviews_collection.find( {} )
list(map(print, r))
```

This will print a list of the review metadata, which includes a review and business id, sentiment, and all entities that were detected in the review text.
```
{'_id': ObjectId('5f461b67711367dc0ecb6f88'), 'date': '2016-8-2 15:52:10', 'entities': [{'count': 1, 'text': 'Tire', 'disambiguation': {'subtype': ['Tires']}, 'type': 'Work_Type', 'confidence': 0.980921}, {'count': 1, 'text': 'Tire', 'disambiguation': {'subtype': ['Tires']}, 'type': 'Work_Type', 'confidence': 0.971195}], 'sentiment': 'positive', 'business_id': '28b43370-5f83-4ffd-a896-3d492f54ec6c', 'review_id': 'e070f172-e1a4-491d-8c0c-ca80a1d4d714'}
.
.
```

Next, we’ll pass a condition to select all reviews that have a “positive” sentiment
```
positive_reviews = list(db.reviews_collection.find( { "sentiment": "positive" }))
```

## Aggregate datasets
In the next section of the notebook, we’ll use aggregation operations to generate statistics about a given collection. Aggregation in this context 

refers to a set of operations that 
Series of methods that 
Way to compute results about a dataset
complex queries

First, we’ll use the `$group` aggregation method to get a breakdown of reviews by sentiment. We’ll do so by mapping the `$sentiment` key to the id. The `$` before sentiment tells mongo to use the variable that matches that particular key. We’ll also use the `$sum` aggregation method to get the total count of reviews by sentiment. The full aggregation method looks like so
```
reviews_by_sentiment = list(db.reviews_collection.aggregate([
    {
        "$group": {
            "_id": '$sentiment',
            "count": { "$sum": 1 }
        } 
    }
]))
```

And the result is
```
[{'_id': 'negative', 'count': 3330},
 {'_id': 'neutral', 'count': 4},
 {'_id': 'positive', 'count': 5726}]
```

We can also then select businesses in a given radius by using the `$geoNear` aggregation method. This method requires a reference coordinate (longitude/latitude) and may also have a radius limit. This also requires us to reference the “location” index we created earlier. So lets say we have a `user_coords` variable that matches a given location. So we’ll provide that in the “near” key as a “Point”. We’ll also add a “maxDistance” value, which will limit the result to those with x meters of the reference point. So the following method will return a list of all mechanic that are within 20km of the reference point.

```
meters = 20000
nearby_mechs = db.businesses_collection.aggregate(
    [{
        "$geoNear": {
            "near": { "type": "Point", "coordinates": user_coords },            
            "distanceField": "calculated",
            "includeLocs": "location",
            "maxDistance": meters,
            "spherical": False            
        }
    }]
)
```

Multiple aggregations can be chained together into a “pipeline”. Here, we’ll showcase an aggregation pipeline that will rank the top mechanics in a given area that specialize in “brake” repairs.

We’ll start the pipeline with a `$match` operation. This is similar to the “find” method we used earlier, as it will return a list of rows that match one or more conditions. In this case, our conditions will be as follows

```
         # Limit reviews to those that reference a “Brake” repair
         "entities.disambiguation.subtype": repair_type,

         # Limit reviews to those that are associated with a mechanic shop within 20km of the user
         "business_id": {"$in": nearby_mech_ids},

         # Only select reviews that have a “positive” or “neutral” sentiment
         "$or": [ {"sentiment": "positive"}, {"sentiment": "neutral"} ]
```

After the match operation, we’ll use the `$group` operation to determine how many reviews referenced brake repairs. The amount per business is then stored in the “repairCount” section.

```
      "$group" :
        {
          "_id" : "$business_id",
          "repairCount": { "$sum": 1 },
        }
```

After getting the “repairCount`, we’ll then run a `$lookup` operation, which will “join” the business collection with the matching reviews. We’re doing this to map the business_id to a name in our final result.
```
      "$lookup": {
        "from": "businesses_collection",
        "localField": "_id",
        "foreignField": "id",
        "as": "business"
      }
```

Then, we define our expected output using the `$project` method to make the result more readable.
```
    { 
      "$project": { 
          "_id": 1,
          "repairCount": 1, 
          "name": 1,
          "location": 1
      }
    },
```

Finally, we’ll use the `$sort` operation to sort the results based on repairCount in descending order.

Once we have our list of mechanics, we can then draw them on a map using ipyleaflet.

