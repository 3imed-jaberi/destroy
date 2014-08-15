
var assert = require('assert')
var fs = require('fs')

var destroy = require('./')

describe('Destroy', function () {
  it('should destroy a stream', function () {
    var stream = fs.createReadStream('package.json')
    assert(!isdestroyed(stream))
    destroy(stream)
    assert(isdestroyed(stream))
  })

  it('should handle falsey values', function () {
    destroy()
  })

  describe('ReadStream', function () {
    it('should not leak fd when called sync to open', function (done) {
      // this test will timeout on a fd leak
      var _close = fs.close
      var _open = fs.open
      var waitclose = false

      function cleanup() {
        fs.close = _close
        fs.open = _open
      }

      fs.close = function close() {
        _close.apply(this, arguments)
        cleanup()
        done()
      }

      fs.open = function open() {
        waitclose = true
        _open.apply(this, arguments)
      }

      var stream = fs.createReadStream('package.json')
      destroy(stream)
      assert(isdestroyed(stream))

      if (waitclose) {
        return
      }

      cleanup()
      done()
    })
  })
})

function isdestroyed(stream) {
  // readable for 0.8, destroyed for 0.10+
  return stream.readable === false || stream.destroyed === true
}
