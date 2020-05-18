var mockUsers = [
  {
    id: "user1234",
    drivingIncidents: [],
    personalInfo: {
      name: "John Doe",
      state: "CA",
      city: "Los Angeles", // zip/address would be better
      maritalStatus: "Single",
      jobStatus: "Employed",
      jobLocation: "Los Angeles, CA",
      age: 30,
      fico: 750
    },
    vehicles: [
      {
        "id": "vehicle1234_9876",
        "make": "Ford",
        "model": "Mustang",
        "year": 1967,
        "color": "red",
        "miles": 140000
      }
    ],
    riskRating: "5", // should be calculated based off ? location, vehicle type/value
    claims: [
      {
        "id": "claim5678",
        "vehicle": "vehicle1234_9876",
        "status": "processing",
        "type": "", // liability, not at fault, total loss ... should be calculated?
        "userStatement": "someone dented my car bumper",
        "type": ["Engine"],
        "date": "01-02-2020",
        "assignedMech": "mechId",
        "assignedAgent": ""
      }
    ],
  },
  {
    id: "user5678",
    personalInfo: {
      name: "Foo Bar",
      location: "Los Angeles, CA", // zip/address would be better
    },
    claims: [
      {
        "id": "claim5678",
        "status": "processing",
        "userStatement": "my windshield was cracked",
        "type": ["Tires"],
        "date": "01-02-2020",
        "assignedMech": "mechId"
      }
    ],
  }
]

