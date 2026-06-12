const sseEmitter = require('./sseManager');

const registerPendingCountsHook = (schema) => {
  const trigger = () => {
    try {
      sseEmitter.emit('pending-counts');
    } catch (e) {
      console.error('Failed to emit pending-counts:', e);
    }
  };

  schema.post('save', trigger);
  schema.post('insertMany', trigger);
  schema.post('findOneAndUpdate', trigger);
  schema.post('updateMany', trigger);
  schema.post('deleteOne', trigger);
  schema.post('deleteMany', trigger);
  schema.post('remove', trigger);
};

module.exports = registerPendingCountsHook;
