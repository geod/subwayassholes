from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time

def scrape(noPolite, noExiting, noAsshole):
    try:
        d = DesiredCapabilities.CHROME
        d['loggingPrefs'] = { 'browser':'ALL' }
        driver = webdriver.Chrome("/Users/ewanlowe/Documents/developerTools/chromedriver", desired_capabilities=d)
        driver.set_window_size(1120, 550)

        url = "http://localhost:8000/index3game.html?noPolite=" + str(noPolite) + "&noExiting=" + str(noExiting) + "&noAsshole=" + str(noAsshole)
        print ("running:" + url)
        driver.get(url)

        finished = False
        t1 = time.time()
        while (not finished):
            elapsed = time.time() - t1
            if elapsed < 30:
                for entry in driver.get_log('browser'):
                    if(entry['message'].__contains__("DONE")):
                        print(entry)
                        finished = True
            else:
                print ("Time limit exceeded:" + str(elapsed))
                finished = True
        driver.quit()
    except Exception as inst:
        print ("inner exception:")
        print(type(inst))
        print(inst.args)
        print(inst)
    finally:
        print ("finally:" + url + " " + str(elapsed))
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    for mx in [16,18,14,12,10]: #growing numbr of people
        for asshole in range(0,mx+1): # for % asshole
            for repetition in range(0,25): # repeat experiment
                try:
                    scrape(mx-asshole,mx,asshole)
                except Exception as inst:
                    print ("outer exception:")
                    print(type(inst))
                    print(inst.args)
                    print(inst)

