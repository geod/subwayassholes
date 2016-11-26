from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from time import time

def scrape(noPolite, noExiting, noAsshole):
    d = DesiredCapabilities.CHROME
    d['loggingPrefs'] = { 'browser':'ALL' }
    driver = webdriver.Chrome("/Users/ewanlowe/Documents/developerTools/chromedriver", desired_capabilities=d)
    driver.set_window_size(1120, 550)

    url = "http://localhost:8000/index3game.html?noPolite=" + str(noPolite) + "&noExiting=" + str(noExiting) + "&noAsshole=" + str(noAsshole)
    print ("running:" + url)
    driver.get(url)

    finished = False
    t1 = time()
    while (not finished):
        elapsed = time() - t1
        if elapsed < 60:
            for entry in driver.get_log('browser'):
                if(entry['message'].__contains__("DONE")):
                    print(entry)
                    finished = True
        else:
            print ("Time limit exceeded:" + str(elapsed))
            finished = True

    print ("finished:" + url + " " + str(elapsed))
    driver.quit()

if __name__ == "__main__":

    for asshole in range(0,10):
        for repetition in range(0,100):
            scrape(10-asshole,10,asshole)

