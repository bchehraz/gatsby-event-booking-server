const User = require('../../models/user');
const Event = require('../../models/event');
const { transformEvent } = require('./merge');

module.exports = {
  events: async ({ wherePrice, sort }) => {
    try {
      const events = await Event.find().where("price").gt(wherePrice.gt).lt(wherePrice.lt).sort(sort);
      return events.map(transformEvent);
    } catch(err) {
      throw err;
    }
  },
  createEvent: async ({ eventInput: { title, description, price, date }}, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    const event = new Event({
      title: title,
      description: description,
      price: price,
      date: new Date(date),
      creator: req.userId,
    });

    try {
      let createdEvent;
      const result = await event.save();
      createdEvent = transformEvent(result);

      const creator = await User.findById(req.userId);

      if (!creator) {
        throw new Error('User not found.');
      }
      creator.createdEvents.push(event);
      await creator.save();

      return createdEvent;
    } catch(err) {
      console.log(err);
      throw err;
    }
  },
}
