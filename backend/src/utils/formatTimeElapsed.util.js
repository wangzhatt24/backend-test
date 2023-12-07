import moment from 'moment';

function changeToUTC7(time) {
  const utc_time = new Date(time);
  const utcOffset = utc_time.getTimezoneOffset() * 60000;
  //   chuyển sang utc + 7
  return new Date(utc_time.getTime() - utcOffset);
}

function formatTimeElapsed(time) {
  const localTime = changeToUTC7(time);

  const currentDate = moment();

  const elapsed = currentDate.diff(localTime);
  const duration = moment.duration(elapsed);

  if (duration.asMonths() >= 1) {
    return moment(localTime).format('DD/MM/YYYY');
  } else {
    if (duration.asWeeks() >= 1) {
      return `${Math.floor(duration.asWeeks())} tuần trước`;
    } else {
      if (duration.asDays() >= 1) {
        return `${Math.floor(duration.asDays())} ngày trước`;
      } else {
        return 'Đăng trong ngày';
      }
    }
  }
}

export default formatTimeElapsed;
