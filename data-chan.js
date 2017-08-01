const MAX_MEASURE_NUM = 8;
var ref = require('ref');
var ffi = require('ffi');
var struct = require('ref-struct');
var ArrayType = require('ref-array');
var uint8_t_ptr = ref.refType(ref.types.uint8);
var measure_t = struct({
  'type' : ref.types.uint8,
  'mu' : ref.types.uint8,
  'measureNum' : ref.types.uint8,
  'channels' : ArrayType('uint8',MAX_MEASURE_NUM),
  'values' :  ArrayType('float',MAX_MEASURE_NUM),
  'time' : ref.types.uint32,
  'millis' : ref.types.uint16
});
var measure_t_ptr = ref.refType(measure_t);
var void_ptr = ref.refType(ref.types.void);
var datachan_device_t = ref.types.void;
var datachan_device_t_ptr = ref.refType(datachan_device_t);
var datachan_acquire_result_t = struct({
  'result' : ref.types.int,
  'device' : datachan_device_t_ptr
});


module.exports.lib =  ffi.Library((__dirname+'/libDataChan').replace('app.asar','app.asar.unpacked'),{
  'datachan_is_initialized' : [ref.types.bool,[]],
  'datachan_init' : [ref.types.void,[]],
  'datachan_shutdown' : [ref.types.void,[]],
  'datachan_device_acquire' : [datachan_acquire_result_t,[ref.types.uint16,ref.types.uint16]],
  'datachan_device_release' : [ref.types.void, [datachan_device_t_ptr]],
  'datachan_device_enable' : [ref.types.bool,[datachan_device_t_ptr]],
  'datachan_device_is_enabled' : [ref.types.bool,[datachan_device_t_ptr]],
  'datachan_device_disable' : [ref.types.bool,[datachan_device_t_ptr]],
  'datachan_send_sync_command' : [ref.types.void,[datachan_device_t_ptr,ref.types.uint8,uint8_t_ptr,ref.types.uint8]],
  'datachan_send_async_command' : [ref.types.void,[datachan_device_t_ptr,ref.types.uint8,uint8_t_ptr,ref.types.uint8]],
  'datachan_device_dequeue_measure' : [measure_t_ptr,[datachan_device_t_ptr]],
  'datachan_device_enqueued_measures' : [ref.types.uint32,[datachan_device_t_ptr]],
  'datachan_device_set_config' : [ref.types.void,[datachan_device_t_ptr,ref.types.uint32,ref.types.uint8,void_ptr,ref.types.uint16]],
  'datachan_clean_measure' : [ref.types.void, [measure_t_ptr]]

});
module.exports.search_enum = {
  'uninitialized' : 0x00,
  'not_found_or_inaccessible' : 0x01,
  'cannot_claim' : 0x02,
  'malloc_fail' : 0x03,
  'unknown' : 0x04,
  'success' : 0xFF
};
module.exports.commands = {
  'set_current_output' : 0x01,
  'set_heater_state' : 0x02,
  'set_channel_gain' : 0x03
};
module.exports.MAX_MEASURE_NUM = MAX_MEASURE_NUM;
