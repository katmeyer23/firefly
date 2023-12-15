export default {
  
	data() {
	  return {
	    month: dayjs.months(),
	    days: dayjs.weekdays(),
	    shortDays: dayjs.weekdaysShort(),
	    timezone: "{{ attr.timezone }}",
	    today: window.dayjs().tz(this.timezone),
	    selectedDate: window.dayjs().tz(this.timezone),
  		allEventList: [],
  		dayjs: window.dayjs,
  		weekdays: [],
  		dayWiseData: [],
  		cacheDayWiseData: [],
  		isLoading: true,
  		category: "",
  		isMobile: window.innerWidth <= 768,
  		categoryList: {{attr.categoryList}},
  		hoverEvent: null,
  		capPosition: 'down'
	  }
	},
	
	computed: {
    selectedMonth() {
      return this.selectedDate.format("MMMM YYYY");
    },
    prevMonth() {
      return this.selectedDate.subtract(1, "month").format("MMMM");
    },
    nextMonth() {
      return this.selectedDate.add(1, "month").format("MMMM");
    },
    weekCount() {     
      return Math.ceil(this.weekdays.length / 7);
    },
    selectedCategory() {
      return this.categoryList.find(category => category.value == this.category).name;
    },
  },
	
	methods: {
	  changeMonth(val) {
	    this.selectedDate = this.selectedDate.startOf("month").add(val, "month");
      if(this.selectedDate.month() == this.today.month() && this.selectedDate.year() == this.today.year()) {
        this.selectedDate = this.today;
      }
      this.category = ""
	    this.updateCalendar();
	    this.isLoading = true;
	    setTimeout(() => {
	      this.filter();
      }, 100);
	  },
	  changeDay(day) {
	    if(day.month() == this.selectedDate.month())
	      this.selectedDate = day
	  },
	  searchCategory(category) {
	    this.category = category
	    this.isLoading = true;
	    setTimeout(() => {
	      this.filter();
      }, 100);
	  },
	  formatDate(dateObj) {	    
	    const todayFormat = this.today.format("MMM DD, YYYY")
      const tomorrow = this.today.add(1, 'day').format("MMM DD, YYYY")
      var formattedDate = dateObj.format("MMM DD, YYYY")
	    if(todayFormat === formattedDate){
        formattedDate = `Today`;
      }
      if(tomorrow === formattedDate){
        formattedDate = `Tomorrow`;
      }
      return `${formattedDate}`;
	  },
	  updateCalendar() {
	    const startOfWeek = this.selectedDate.startOf("month").startOf("week");
      let isMonthEnded = false;
      let endOfWeek = false;
      
      var weekdays = new Array(35).fill(startOfWeek).map((day, idx) => {
        if(this.selectedDate.endOf("month").format("dddd, MMMM D YYYY") === day.add(idx, "day").format("dddd, MMMM D YYYY"))
          isMonthEnded = true
        endOfWeek = day.add(idx, "day").endOf("week");
        return day.add(idx, "day");
      });
      
      if(!isMonthEnded){
        var newWeekdays = new Array(7).fill(endOfWeek.add(1, "day")).map((day, idx) => {
          return day.startOf("day").add(idx, "day");
          //return day.add(idx, "day");
        });
        weekdays = weekdays.concat(newWeekdays);
      }
      this.weekdays = weekdays;
	  },
	  filter() {
	    var searchEventList = this.allEventList;
	    var dayWiseData = [];
	    this.weekdays.map(day => {
	      let dataNw = window.dayjs(day).format('YYYY-MM-DD');
	      if (dataNw in searchEventList) {  
  	      if(typeof this.cacheDayWiseData[`${day.valueOf()}`] == "undefined") {
  	        this.cacheDayWiseData[`${day.valueOf()}`] = dayWiseData[`${day.valueOf()}`] = searchEventList[dataNw].filter(EventPost => {
            
              var start = this.dayjs(EventPost.startDate).tz(this.timezone)
              var end = this.dayjs(EventPost.endDate).tz(this.timezone)
              
              var startDateFormat = this.formatDate(start);
              var endDateFormat = this.formatDate(end);
              
              var startTimeFormat = ""
              var endTimeFormat = ""
              
              if({{ attr.displayTime }}) {
                startTimeFormat = start.format('hh:mm A')
                endTimeFormat = end.format('hh:mm A')
              }
              if(startDateFormat == endDateFormat){
                endDateFormat = ""
              }
              if(EventPost.startDate == EventPost.endDate){
                endTimeFormat = endDateFormat = ""
              }
              
              EventPost['formatDate'] = `${startDateFormat} ${startTimeFormat}`;
              EventPost['formatDate'] += (endDateFormat != "" || endTimeFormat != "") ? " - " : "";
              EventPost['formatDate'] += `${endDateFormat} ${endTimeFormat}`;


              return EventPost["{{ attr.categoryKeyName }}"] == (this.category != "" ? this.category : EventPost["{{ attr.categoryKeyName }}"]) && (
                (day.startOf("day").unix() >= start.startOf("day").unix() && day.startOf("day").unix() <= end.startOf("day").unix()) ||
                (day.date() >= (start.date()) && day.month() >= (start.month()) && day.year() >= (start.year()) &&
                day.date() <= (end.date()) && day.month() <= (end.month()) && day.year() <= (end.year()))
              )
             
              //return EventPost["{{ attr.categoryKeyName }}"] == (this.category != "" ? this.category : EventPost["{{ attr.categoryKeyName }}"]) && dayjs(dataNw).isBetween(dayjs(start).startOf("day"), dayjs(end).endOf("day"), "day", '[]')
            });
  	      } else {
  	        
  	        dayWiseData[`${day.valueOf()}`] = this.cacheDayWiseData[`${day.valueOf()}`].filter(EventPost => EventPost["{{ attr.categoryKeyName }}"] == (this.category != "" ? this.category : EventPost["{{ attr.categoryKeyName }}"]));
  	      }
	      }
      });
      
      this.dayWiseData = dayWiseData;
      this.isLoading = false;
      this.updateLinks();
	  },
	  dayCountInRow(index) {
      return this.weekdays.slice((index - 1) * 7, index * 7)
    },
    windowResized() {
      this.isMobile = window.innerWidth <= 768
    },
    updateLinks() {
      this.$nextTick(() => {
        let descriptionElements = this.$el.querySelectorAll('.description_detail a');
        descriptionElements.forEach(el => {
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener noreferrer');  // For security
        });
      });
    },
    calculateCapPosition(event, uniqueId) {
      this.hoverEvent = uniqueId;
      const listItem = this.$refs.listItems.find(item => item.getAttribute('data-unique-id') === uniqueId);
      if (!listItem) {
        return; 
      }
      const rect = listItem.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const threshold = viewportHeight * 0.33;  // 33% of the viewport height
      const spaceBelow = viewportHeight - rect.bottom;
    
      if (spaceBelow < threshold) {
        this.capPosition = 'up';
      } else {
        this.capPosition = 'down';
      }
    },
	},
	
	created() {
    window.addEventListener("resize", this.windowResized);
  },
  destroyed() {
    window.removeEventListener("resize", this.windowResized);
  },
	
mounted() {
	 var that = this;
    this.updateCalendar();
    var allTimeList = [];
    let response = axios.get("{{ attr.sourceUrl }}")
  
	  response.then(({data}) => {
	    
	   this.allEventList = ('events' in data) ? data.events : data;
      this.allEventList.forEach(function(obj) {
         obj['allDateList']  = [];
         obj['uniqueId'] = `${obj.eventName}-${obj.startDate}`;
         if(obj.endDate && (obj.startDate != obj.endDate)) {
      	    var start = window.dayjs(obj.startDate).tz(that.timezone);
      	    var end = window.dayjs(obj.endDate).tz(that.timezone);

            var tempDate = start.startOf('day');
      	    while(tempDate < end){       	      
              obj['allDateList'].push(window.dayjs(tempDate).toJSON().slice(0, 10));
              tempDate = tempDate.add(1, "day");
            }      
          } else {    
            obj['allDateList'].push(window.dayjs(obj.startDate).tz(that.timezone).toJSON().slice(0, 10));
          }
          obj.allDateList.forEach(function(time,index){  
            if (time in allTimeList) {
              let newindex = allTimeList[time].length;
              allTimeList[time][newindex] = obj;             
            } else { 
              allTimeList[time] = [];
              allTimeList[time][0] = obj;
      	    }
          }); 
      });
      this.allEventList = allTimeList;
	    this.filter();
	    this.updateLinks();
	  });
	}
  
}