import _ from 'lodash';

export function getRandomNumber(args: {
  from: number;
  to: number;
  exclude?: number[];
  floating?: boolean;
}): number {
  let num = _.random(args.from, args.to, args.floating);
  if (args.exclude?.includes(num)) {
    return getRandomNumber(args);
  }
  return num;
}
