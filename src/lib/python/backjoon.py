
# -*- coding: utf-8 -*-
import requests
from bs4 import BeautifulSoup
import json
import time
from pprint import pprint as pp
import re
import copy
import sys
# sys.path.insert(0, "C:\\Users\\seo\\Anaconda3\\lib\\site-packages")


def getBackjoon(backjoonNum):
    url = 'https://www.acmicpc.net/problem/' + backjoonNum
    payload = {}
    headers = {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'sec-fetch-mode': 'nested-navigate',
        'sec-fetch-site': 'same-origin',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36',
        'referer': 'https://movie.naver.com/'
    }
    r = requests.get(url, params=payload, headers=headers)
    soup = BeautifulSoup(r.text, "html.parser")

    originDict = {}
    thList = soup.select('#problem-info th')
    tdList = soup.select('#problem-info td')

    tempDict = {}
    for idx, td in enumerate(tdList):
        tempDict[thList[idx].getText()] = td.getText()
    originDict['info'] = tempDict
    originDict['description'] = str(soup.select('#problem_description')[0])
    originDict['input'] = str(soup.select('#problem_input')[0])
    originDict['output'] = str(soup.select('#problem_output')[0])

    sampleData = soup.select('.sampledata')
    #sampleDataList = {}
    sampleDataList = []
    sampleTempDataList = {}
    index = 0
    for idx, data in enumerate(sampleData):
        if idx % 2 == 0:
            sampleTempDataList['input'] = data.getText()
        else:
            sampleTempDataList['output'] = data.getText()
            temp = copy.deepcopy(sampleTempDataList)
            #sampleDataList[index] = temp
            sampleDataList.append(temp)
            sampleTempDataList.clear()
            index += 1
    originDict['sampleData'] = sampleDataList

    print(json.dumps(originDict))

    sys.stdout.flush()


if __name__ == "__main__":

    text = re.sub(
        '[-=+,#/\?:^$.@*\"※~&%ㆍ!』\\‘|\(\)\[\]\<\>`\'…》]', '', sys.argv[1])
    #print({"hello": 1})
    TEST = True
    if TEST:
        getBackjoon(str(text))
        pass
