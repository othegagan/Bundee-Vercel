import { parse, format } from 'date-fns';

export const dateFormatter = (dateString) => {
    const parsedDate = parse(dateString, "yyyy-MM-dd HH:mm:ss.SSSSSSxxx", new Date());
    const formattedDate = format(parsedDate, "LLL yyyy");
    return formattedDate;
};
