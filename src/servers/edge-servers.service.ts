import { Injectable } from '@nestjs/common';
import { CreateEdgeServerDto } from './dto/create-edge-server.dto';
import { ref_values } from '../util/util-data/reference-values';
import { compareTransmissionTimes } from './util-functions/transmissionTime';
import { cloudServer, edgeServer } from './dto/servers.data';

@Injectable()
export class EdgeServersService {
  create(createEdgeServerDto: CreateEdgeServerDto) {
    return 'This action adds a new edgeServer';
  }

  runtest(data) {
    let result = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      let returnedData = this.checkHealthParameter(
        element.age,
        element.sex,
        element.key,
        element.inputValues,
      );
      result.push(returnedData);
    }

    let x = compareTransmissionTimes(data, edgeServer, cloudServer)
    console.log(x)
    return result;
  }
  checkHealthParameter(age, sex, key, inputValues) {
    const param = ref_values.find((p) => p.key === key);
    if (!param) return { error: `Invalid parameter key: ${key}` };

    const unit = param.unit;
    const ageGroup = param.age_groups.find(
      (group) => age >= group.min_age && age <= group.max_age,
    );
    if (!ageGroup)
      return { error: 'No reference range found for the given age' };

    const sexGroup = ageGroup[sex];
    if (!sexGroup || !sexGroup.value)
      return { error: `No data for sex "${sex}"` };

    const results = [];

    for (const reference of sexGroup.value) {
      const { label, lower_bound, upper_bound } = reference;

      const inputValue = inputValues[label];
      if (inputValue === undefined) {
        results.push({
          label,
          status: 'missing',
          message: `Missing input for label "${label}"`,
          unit,
          expected_range: { lower_bound, upper_bound },
        });
        continue;
      }

      // const withinRange =
      //   inputValue >= lower_bound && inputValue <= upper_bound;
      // const difference = withinRange ? 0 : inputValue < lower_bound ? +(lower_bound - inputValue).toFixed(2) : +(inputValue - upper_bound).toFixed(2);

      let difference;
      const withinRange =
        inputValue >= lower_bound && inputValue <= upper_bound;
      let result;

      if (withinRange) {
        difference = 0;
        result = 'normal'; // Or you can set it to an empty string, or handle it differently
      } else if (inputValue < lower_bound) {
        difference = +(lower_bound - inputValue).toFixed(2);
        result = 'hypo';
      } else {
        // inputValue > upper_bound
        difference = +(inputValue - upper_bound).toFixed(2);
        result = 'hyper';
      }
      results.push({
        label,
        value: inputValue,
        // status: withinRange ? 'within range' : 'out of range',
        difference,
        unit,
        expected_range: { lower_bound, upper_bound },
        result,
      });
    }

    // console.log({
    //   measured_parameter: param.measured_parameter,
    //   key,
    //   age,
    //   sex,
    //   unit,
    //   results,
    // });

    return {
      measured_parameter: param.measured_parameter,
      key,
      age,
      sex,
      unit,
      results,
    };
  }
}
