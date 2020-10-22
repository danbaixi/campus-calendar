import React from 'react'
import './assets/css/index.css'
import ArrowLeftBold from './assets/imgs/arrow-left-bold.png'
import ArrowRightBold from './assets/imgs/arrow-right-bold.png'

//默认配置
const defaultConfig = {
    "weekdays":["日","一","二","三","四","五","六"],
    "colors": [
        "#e54d42",
        "#6739b6",
        "#1cbbb4",
        "#fbbd08",
        "#f37b1d",
        "#e03997",
        "#557571",
        "#28df99",
        "#9c26b0",
        "#09bb07",
        "#0081ff"
    ],
    "dateDelimiter": "-",
    "displayPreMonthDate": true,
    "displayNextMonthDate": true
}

//默认数据
const defaultData = {
    "terms": [],
    "events": []
}

class Calendar extends React.Component {
    constructor(props) {
        super(props)
        let configs = Object.assign(defaultConfig,props.config)
        let data = Object.assign(defaultData,props.data)
        let terms = data.terms, events = data.events
        let date = new Date()
        let [nowYear, nowMonth, nowDay] = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
        let [thisYear, thisMonth] = [nowYear, nowMonth]

        this.state = {
            weeklys: [],
            days: [],
            thisEvents: [],
            nowYear,
            nowMonth,
            nowDay,
            thisYear,
            thisMonth,
            terms,
            events,
            configs
        }
    }
    componentWillMount() {
        //初始化数据
        this.getData(this.state.thisYear, this.state.thisMonth)
    }
    getData(thisYear,thisMonth){
        let _this = this
        let works = async function(){
            try{
                await _this.getDates(thisYear, thisMonth)
                await _this.getWeekly()
                await _this.getEvents(thisYear, thisMonth)
            }catch(e){
                alert(e)
            }
        }
        works().then(() => {
            // console.log("数据加载完成")
        }).catch((error) => {
            console.log("加载失败：" + error)
        })
    }
    getDates(thisYear, thisMonth) {
        let dayCount = new Date(thisYear, thisMonth, 0).getDate()
        let firstWeekly = calcMonthFirstDay(thisYear, thisMonth)
        let rowCount = 5
        let days = []
        let lastCount = 0
        if (firstWeekly === 6 || firstWeekly >= 5 && dayCount === 31) {
            rowCount = 6
        }
        lastCount = rowCount * 7 - dayCount - firstWeekly
        //获取上个月最后一个日期
        let [preYear, preMonth] = getNearbyMonth(thisYear, thisMonth, 'pre')
        let preMonthDayCount = new Date(preYear, preMonth, 0).getDate()
        for (let i = firstWeekly - 1; i >= 0; i--) {
            days.push({
                text: this.state.configs.displayPreMonthDate ? preMonthDayCount - i : "",
                type: "gray"
            })
        }
        for (let i = 0; i < dayCount; i++) {
            days.push({
                text: i + 1,
                type: "black"
            })
        }
        for (let i = 0; i < lastCount; i++) {
            days.push({
                text: this.state.configs.displayNextMonthDate ? i + 1 : "",
                type: "gray"
            })
        }
        this.setState({
            dayCount,
            firstWeekly,
            lastCount,
            rowCount,
            days
        })
    }
    //获取对应的学期和开学日期
    getTerm(year, month) {
        let terms = this.state.terms
        let date = parseInt(year + '' + fillZeroForNumber(month))
        for (let i = terms.length - 1; i >= 0; i--) {
            let arr = splitDate(terms[i].start,this.state.configs.dateDelimiter)
            let termDate = parseInt(arr[0] + arr[1])
            if (date >= termDate) {
                return terms[i]
            }
        }
        return null
    }
    //获取当前月份的周数列表
    getWeekly() {
        let result = new Array(this.state.rowCount)
        let thisTerm = this.getTerm(this.state.thisYear, this.state.thisMonth)
        if (!thisTerm) {
            this.setState({
                thisTerm,
                weeklys: result.fill('假期')
            })
            return
        }
        let [termYear, termMonth, termDay] = splitDate(thisTerm.start,this.state.configs.dateDelimiter)
        let [termEndYear, termEndMonth, termEndDay] = splitDate(thisTerm.end,this.state.configs.dateDelimiter)
        //当月的第一天是星期几
        let firstDay = calcMonthFirstDay(this.state.thisYear, this.state.thisMonth)
        //当月第一个星期五的日期
        let SatDay = 6 - firstDay
        //当月天数
        let dayCount = new Date(this.state.thisYear, this.state.thisMonth, 0).getDate()

        let termDate = new Date(`${termYear}/${termMonth}/${termDay}`)
        let termEndDate = new Date(`${termEndYear}/${termEndMonth}/${termEndDay}`)
        for (let i = 0; i < this.state.rowCount; i++) {
            let day = SatDay + i * 7
            let year = this.state.thisYear
            let month = this.state.thisMonth
            if (day > dayCount) {
                month++
                day = day - dayCount
                if (month > 12) {
                    year++
                    month = 1
                }
            }
            let satDay = new Date(`${year}/${month}/${day}`)
            if (satDay < termDate) {
                result.push('假期')
            } else {
                let weekly = Math.ceil((satDay - termDate) / 1000 / 60 / 60 / 24 / 7)
                if (satDay <= termEndDate) {
                    result.push(`第${fillZeroForNumber(weekly)}周`)
                } else {
                    result.push('假期')
                }

            }
        }
        this.setState({
            weeklys: result,
            thisTerm
        })
    }
    //获取校历事件
    getEvents() {
        let events = this.state.events
        let thisEvents = []
        let days = this.state.days
        events.map((item) => {
            let startDate = splitDate(item.start,this.state.configs.dateDelimiter)
            let endDate = []
            if (item.hasOwnProperty('end')) {
                endDate = splitDate(item.end,this.state.configs.dateDelimiter)
            }
            if ((startDate[0] == this.state.thisYear && startDate[1] == this.state.thisMonth) || (endDate && endDate[0] == this.state.thisYear && endDate[1] == this.state.thisMonth)) {
                //简化日期
                item.dateItem = item.start + (item.end ? ' 至 ' + item.end : '')
                //高亮范围
                //将日期转为坐标
                let coors = [], marks = []
                let markStart = startDate[2],
                    markEnd = startDate[2],
                    firstDay = calcMonthFirstDay(startDate[0], startDate[1])
                //跨月份情况，只允许跨一个月
                if(endDate.length > 0){
                    markEnd = parseInt(endDate.length > 0 ? endDate[2] : startDate[2])
                    //当月第一天是星期几
                    if(startDate[1] === endDate[1]){
                        //同月份情况
                        markStart = startDate[2]
                    }else{
                        //跨月份情况
                        if(this.state.thisMonth == startDate[1]){
                            markStart = startDate[2]
                            markEnd = new Date(startDate[0],startDate[1],0).getDate()
                        }else if(this.state.thisMonth == endDate[1]){
                            markStart = 1
                            markEnd = endDate[2]
                            firstDay = calcMonthFirstDay(endDate[0], endDate[1])
                        }
                    }
                }
                for (let i = parseInt(markStart); i <= markEnd; i++) {
                    let row = Math.floor((i + firstDay - 1) / 7)
                    let column = (i + firstDay - 1) % 7
                    if (!coors[row]) {
                        coors[row] = []
                    }
                    coors[row].push(column)
                    //文字颜色
                    days[i + firstDay - 1].type = 'white'
                }
                //串联
                for (let index in coors) {
                    marks.push({
                        start: coors[index][0], //起始点
                        row: parseInt(index), //第几行
                        length: coors[index].length //长度
                    })
                }
                item.marks = marks
                thisEvents.push(item)
            }
        })
        this.setState({
            days,
            thisEvents
        })
    }
    //切换月份
    changeMonth(type) {
        let [thisYear, thisMonth] = getNearbyMonth(this.state.thisYear, this.state.thisMonth, type)
        this.setState({
            thisYear,
            thisMonth
        })
        this.getData(thisYear,thisMonth)
    }
    //TODO 选择月份
    selectMonth() {

    }
    //TODO 选择学期
    selectTerm(){

    }
    render() {
        const rowHeight = 56 // 格子高度
        const rowWidth = Math.floor(100 / 7 * 100) / 100 //格子宽度 
        return (
            <div className="container">
                <div className="header">
                    <div className="term-info">
                        <span>{this.state.thisYear}</span> 年 <span className="text-theme text-blod">{fillZeroForNumber(this.state.thisMonth)}</span> 月
                        {/* {this.state.thisTerm ? this.state.thisTerm.title : '无'} */}
                    </div>
                    <div className="option-item left" onClick={this.changeMonth.bind(this, 'pre')}>
                        <img src={ArrowLeftBold} />
                    </div>
                    <div className="option-item right" onClick={this.changeMonth.bind(this, 'next')}>
                        <img src={ArrowRightBold} />
                    </div>
                </div>
                <div className="date-header">
                    <div className="weekly">周次</div>
                    {
                        this.state.configs.weekdays.map((item, index) => <div className="weekday" key={index}>{item}</div>)
                    }
                </div>
                <div className="date-data">
                    <div className="weekly">
                        {this.state.weeklys.map((item, index) => <div className="weekly-item item" key={index}>{item}</div>)}
                    </div>
                    <div className="dates">
                        {
                            this.state.days.map((item, index) => {
                                return (
                                    <div className={'item text-' + item.type} key={index} >{item.text}</div>
                                )
                            })
                        }
                        {
                            this.state.thisEvents.map((item, eventIndex) => {
                                if (!item.marks) {
                                    return
                                }
                                return item.marks.map((mark, index) => {
                                    let style = {
                                        width: item.marks.length == 1 && mark.length == 1 ? (rowWidth - 4) + '%' : (mark.length * rowWidth) + '%',
                                        top: mark.row * rowHeight + 'px',
                                        left: mark.start * rowWidth + (item.marks.length == 1 && mark.length == 1 ? 2 : 0) + '%',
                                        background: this.state.configs.colors[eventIndex % this.state.configs.colors.length]
                                    }
                                    return (
                                        <div
                                            className={
                                                'mark ' + (item.marks.length == 1 && mark.length == 1 ? 'single' : 'multi')
                                                + (mark.length + mark.start == 7 ? ' mark-end' : '')
                                                + (mark.start == 0 ? ' mark-start' : '')
                                            }
                                            style={style}
                                            key={index}
                                        >
                                        </div>
                                    )
                                })
                            })
                        }
                    </div>
                </div>
                {
                    this.state.thisEvents.length > 0 &&
                    <div className="events">
                        {
                            this.state.thisEvents.map((item, index) => {
                                return (
                                    <div className="events-item" key={index}>
                                        <div className="slot">
                                            <div className="slot-item" style={{background:this.state.configs.colors[index % this.state.configs.colors.length]}}></div>
                                        </div>
                                        <div className="event">
                                            <div className="event-title text-cut">{item.title}</div>
                                            <div className="event-date">{item.dateItem}</div>
                                        </div>
                                        
                                    </div>
                                )
                            })
                        }
                    </div>
                }
            </div>
        )
    }
}

// 公共方法
//日期分割
const splitDate = function(date,delimiter){
    return date.split(delimiter)
}
//计算每个月的第一天是星期几
const calcMonthFirstDay = function(year,month){
    return new Date(year,month-1,1).getDay()
}

//数字补零
const fillZeroForNumber = function(month){
    return month > 9 ? month : '0' + month
}

//获取上下个月
const getNearbyMonth = function(year,month,type){
    if(type == 'pre'){
        if(month == 1){
            year--
            month = 12
        }else{
            month--
        }
    }else if(type == 'next'){
        if(month == 12){
            year++
            month = 1
        }else{
            month++
        }
    }
    return [year,month]
}

export default Calendar