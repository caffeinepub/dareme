import List "mo:core/List";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

actor {
  type Dare = {
    id : Nat;
    dare : Text;
    caption : Text;
    category : Text;
  };

  module Dare {
    public func compare(dare1 : Dare, dare2 : Dare) : Order.Order {
      Int.compare(dare1.id, dare2.id);
    };
  };

  let dares = List.fromArray<{ id : Nat; dare : Text; caption : Text; category : Text }>([
    // Funny Dares
    {
      id = 1;
      dare = "Do your best chicken dance in the middle of the room.";
      caption = "Chickening out!";
      category = "Funny";
    },
    {
      id = 2;
      dare = "Make the funniest face you can for 10 seconds.";
      caption = "Silly faces galore!";
      category = "Funny";
    },
    {
      id = 3;
      dare = "Talk in a British accent for the next round.";
      caption = "Cheerio!";
      category = "Funny";
    },
    {
      id = 4;
      dare = "Do your best impression of our teacher.";
      caption = "Spot on or not?";
      category = "Funny";
    },
    {
      id = 5;
      dare = "Act like a monkey until it's your turn again.";
      caption = "Going bananas!";
      category = "Funny";
    },
    // Awkward Dares
    {
      id = 6;
      dare = "Text your crush and tell them you like them (or make up a funny message if you don't have one).";
      caption = "Brave or just awkward?";
      category = "Awkward";
    },
    {
      id = 7;
      dare = "Call your mom and ask her how to boil water.";
      caption = "Classic confusion!";
      category = "Awkward";
    },
    {
      id = 8;
      dare = "Post a random picture on social media with the caption 'Guess what this means?!'";
      caption = "Time for some mystery!";
      category = "Awkward";
    },
    {
      id = 9;
      dare = "Ask a stranger for a selfie together.";
      caption = "Building confidence!";
      category = "Awkward";
    },
    {
      id = 10;
      dare = "Share your most embarrassing story with the group.";
      caption = "Cringe-worthy moments!";
      category = "Awkward";
    },
    // Emotional Dares
    {
      id = 11;
      dare = "Say something positive about every person in the room.";
      caption = "Spreading kindness!";
      category = "Emotional";
    },
    {
      id = 12;
      dare = "Share a memory that always makes you smile.";
      caption = "Nostalgic moments!";
      category = "Emotional";
    },
    {
      id = 13;
      dare = "Tell someone what you appreciate most about them.";
      caption = "Heartfelt confessions!";
      category = "Emotional";
    },
    {
      id = 14;
      dare = "Share your biggest fear with the group.";
      caption = "Getting real!";
      category = "Emotional";
    },
    {
      id = 15;
      dare = "Describe your perfect day.";
      caption = "Dreams come true!";
      category = "Emotional";
    },
    // School Dares
    {
      id = 16;
      dare = "Do your best impression of a strict teacher.";
      caption = "Keeping us in line!";
      category = "School";
    },
    {
      id = 17;
      dare = "Write a love letter to your favorite subject.";
      caption = "Subject crushes!";
      category = "School";
    },
    {
      id = 18;
      dare = "Pretend to be the principal for one minute and give a crazy announcement.";
      caption = "Taking charge!";
      category = "School";
    },
    {
      id = 19;
      dare = "Do 10 jumping jacks while reciting the alphabet backwards.";
      caption = "Brain and body workout!";
      category = "School";
    },
    {
      id = 20;
      dare = "Sing the school anthem as loudly as you can.";
      caption = "Show school spirit!";
      category = "School";
    },
  ]);

  public query ({ caller }) func getDareById(id : Nat) : async Dare {
    switch (dares.find(func(dare) { dare.id == id })) {
      case (null) { Runtime.trap("Dare not found") };
      case (?dare) { dare };
    };
  };

  public query ({ caller }) func getDaresByCategory(category : Text) : async [Dare] {
    dares.filter(func(dare) { Text.equal(dare.category, category) }).toArray().sort();
  };

  public query ({ caller }) func getAllCategories() : async [Text] {
    let categories = List.empty<Text>();
    for (dare in dares.values()) {
      if (not categories.contains(dare.category)) {
        categories.add(dare.category);
      };
    };
    categories.toArray();
  };

  public query ({ caller }) func getAllDares() : async [Dare] {
    dares.toArray().sort();
  };
};
