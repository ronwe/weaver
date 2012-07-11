fml.define('weave/data' ,[] , function(require , exports){
		var eventData = {},
			domuid = 1

		exports.removeData = function (elem , type){
			var elemId = elem._wuid
			if (!elemId || ! eventData[elemId]) return
			if (type) eventData[elemId][type] = []
			else delete eventData[elemId]
		}
		exports.getData = function (elem , type){
			var elemId = elem._wuid
			if (!elemId) elemId = elem._wuid = domuid++

			if (!eventData[elemId] ) eventData[elemId] = {}
			if (type){
				if (!eventData[elemId][type])  eventData[elemId][type] = []
				 return eventData[elemId][type]
			}else	return eventData[elemId]
		}
	
	
	});
