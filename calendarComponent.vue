.event-calendar
  .cal_navigation
    button.prev(@click="changeMonth(-1)") &laquo; {{{ prevMonth }}}
    button.next(@click="changeMonth(1)") {{{ nextMonth }}} &raquo;
  .calendar_block
    .grid
      h2.cale_title {{{ selectedMonth }}}
      .dropdown
        a.item(role="button") {{{selectedCategory}}}
        .dropdown-content
          a.drop-item(v-for="category in categoryList" role="button" @click='searchCategory(category.value)') {{{ category.name }}}
    table.table_calendar(cellpadding='0' cellspacing='0')
      thead
        tr
          th.longDays(v-for="day in days") {{{ day }}}
          th.shortDays(v-for="day in shortDays") {{{ day }}}
      tbody#calendar-body(v-bind:class="{'loading' : isLoading}")
        tr(v-for="week in weekCount")
          td(v-for="day in dayCountInRow(week)", v-bind:class="{'disable' : day.month() != selectedDate.month(), 'active' : day.month() == selectedDate.month() && day.date() == selectedDate.date() && day.year() == selectedDate.year(), 'today' : day.month() == today.month() && day.date() == today.date() && day.year() == today.year(), 'hasEvents': dayWiseData[`${day.valueOf()}`] && Object.keys(dayWiseData[`${day.valueOf()}`]).length}", @click="changeDay(day)")
            span.date {{{ day.format("D") }}}
            ul.event_list(v-if="!isMobile")
              li(v-for="(events, index) in dayWiseData[`${day.valueOf()}`]",
                :key="events.uniqueId",
                :data-unique-id="events.uniqueId",
                ref="listItems",
                :class="{ 'is-hovered': hoverEvent === events.uniqueId }",
                @mouseover="calculateCapPosition($event, events.uniqueId)",
                @mouseleave="hoverEvent = null")
                p.event_title {{{ events.eventName }}}
                .event_cap(:class="{'is-visible': hoverEvent === events.uniqueId, 'is-up': capPosition === 'up', 'is-down': capPosition === 'down'}")
                  h3 {{{ events.eventName }}}
                  small.evnt_full_date {{{ events.formatDate }}}
                  .description
                    img(v-if="events.image" :srcset='events.imageDetail.srcset' :src='events.imageDetail.src' :sizes='events.imageDetail.sizes' :alt='events.imageDetail.alt' loading="lazy" decoding="async" :height='events.imageDetail.height' :width='events.imageDetail.width')
                    .description_detail(v-html="events.description")
  .event_detail_mob(v-if="isMobile")
    .event_items
      .event_item(v-for="events in dayWiseData[`${selectedDate.startOf('day').valueOf()}`]")
        h4
          p.event_title {{{ events.eventName }}}
        .event_block
          figure(v-if="events.image")
            img(v-if="events.image" :srcset='events.imageDetail.srcset' :src='events.imageDetail.src' :sizes='events.imageDetail.sizes' :alt='events.imageDetail.alt' loading="lazy" decoding="async" :height='events.imageDetail.height' :width='events.imageDetail.width')
          .right_detail
            p
              span.date {{{ events.formatDate }}}
              span(v-html="events.description")