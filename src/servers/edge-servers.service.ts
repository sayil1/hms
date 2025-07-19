import { Injectable } from '@nestjs/common';
import { CreateEdgeServerDto } from './dto/create-edge-server.dto';
import { ref_values } from '../util/util-data/reference-values';
import { compareTransmissionTimes } from './util-functions/transmissionTime';
import { cloudServer, edgeServer } from './dto/servers.data';
import { calculateTransmissionCost } from './util-functions/transmissionCost';

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

    let transmission_time = compareTransmissionTimes(data, edgeServer, cloudServer)
    let transmission_cost = calculateTransmissionCost(data, edgeServer, cloudServer)
    return {
      health_parameter: result,
      transmission_time: transmission_time,
      transmission_cost: transmission_cost
    };
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

      let difference;
      const withinRange =
        inputValue >= lower_bound && inputValue <= upper_bound;
      let result;

      if (withinRange) {
        difference = 0;
        result = 'normal';
      } else if (inputValue < lower_bound) {
        difference = +(lower_bound - inputValue).toFixed(2);
        result = 'hypo';
      } else {
        difference = +(inputValue - upper_bound).toFixed(2);
        result = 'hyper';
      }
      results.push({
        label,
        value: inputValue,
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
